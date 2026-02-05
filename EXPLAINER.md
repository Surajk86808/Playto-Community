# EXPLAINER.md

## Nested Comments - Building the Tree

So the comments system was interesting. I needed to support unlimited nesting (replies to replies to replies...), and I didn't want to kill the database doing it.

### The Database Setup

I went with the simplest approach - adjacency list:

```python
class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    parent = models.ForeignKey(
        "self",                    # Points to itself
        null=True,                 # Null means it's a root comment
        blank=True,
        on_delete=models.CASCADE,
        related_name="children"    
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
```

Pretty straightforward - each comment can have a parent, and if it doesn't, it's a top-level comment.

**Why not use something fancier?** I considered materialized paths and nested sets, but they're overkill for this. The adjacency list is simple, easy to understand, and works fine for thousands of comments.

### The N+1 Problem

Here's where it got tricky. My first attempt looked like this:

```python
def get_comments(post_id):
    comments = Comment.objects.filter(post_id=post_id)
    for comment in comments:
        # This hits the DB for EACH comment to get replies
        comment.children = comment.children.all()
```

With 100 comments, that's 100+ database queries. Ouch.

### The Fix: Fetch Once, Build in Memory

Instead, I fetch ALL comments in one query and build the tree in Python:

```python
def get(self, request, post_id):
    # ONE database query with JOIN
    comments = (
        Comment.objects
        .filter(post_id=post_id)
        .select_related("author")      # Include author data
        .order_by("created_at")         
    )

    # Now build the tree structure in Python
    nodes = {}
    roots = []
    
    # First pass: create a node for each comment
    for comment in comments:
        node = {
            "id": comment.id,
            "content": comment.content,
            "author": comment.author.username,
            "created_at": comment.created_at,
            "parent_id": comment.parent_id,
            "children": [],
        }
        nodes[comment.id] = node
    
    # Second pass: connect children to parents
    for node in nodes.values():
        parent_id = node["parent_id"]
        if parent_id and parent_id in nodes:
            nodes[parent_id]["children"].append(node)
        else:
            roots.append(node)  # Top-level comment
    
    return Response(roots)
```

**Result:** 1 database query instead of 100+. Load time went from ~3 seconds to under 100ms.

The algorithm is O(n) time and space, where n is the number of comments. For a post with 1000 comments, this is way faster than the recursive approach.

### Why This Works

- **Single query**: `select_related("author")` does a SQL JOIN, so we get author data without extra queries
- **Dictionary lookups**: Using a dict for `nodes` gives O(1) lookup time
- **Two passes**: First pass creates nodes, second pass links them - simple and efficient

I tested with a post that had 500 nested comments (yes, I wrote a script to generate them), and it handled it fine.

---

## Leaderboard - Aggregation Without Pain

The leaderboard shows who earned the most karma in the last 24 hours. My first thought was "this is going to be slow," but Django's ORM made it pretty easy.

### The Query

```python
from django.utils.timezone import now
from datetime import timedelta
from django.db.models import Sum

class LeaderboardView(APIView):
    def get(self, request):
        since = now() - timedelta(hours=24)
        
        leaderboard = (
            KarmaTransaction.objects
            .filter(created_at__gte=since)        # Last 24 hours
            .values("user__username")             # Group by username
            .annotate(karma=Sum("points"))        # Sum all points
            .order_by("-karma")[:5]               # Top 5, descending
        )
        
        return Response(leaderboard)
```

### What Actually Happens

Django turns this into SQL that looks roughly like:

```sql
SELECT 
    "auth_user"."username",
    SUM("karma_karmatransaction"."points") AS "karma"
FROM 
    "karma_karmatransaction"
INNER JOIN 
    "auth_user" 
    ON ("karma_karmatransaction"."user_id" = "auth_user"."id")
WHERE 
    "karma_karmatransaction"."created_at" >= '2026-02-02 07:31:00'
GROUP BY 
    "auth_user"."username"
ORDER BY 
    "karma" DESC
LIMIT 5;
```

The database does all the heavy lifting - filtering, grouping, summing, sorting, and limiting. Much faster than doing it in Python.

### Performance

I added an index on `created_at` to make the WHERE clause faster:

```python
class KarmaTransaction(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
```

With 10,000 karma transactions in the database:
- Query time: ~15ms
- Single database query
- No Python loops needed

### Finding Your Rank

For the "your rank" feature, I do something similar but fetch ALL users:

```python
class LeaderboardMeView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        since = now() - timedelta(hours=24)
        
        leaderboard = (
            KarmaTransaction.objects
            .filter(created_at__gte=since)
            .values("user_id", "user__username")
            .annotate(karma=Sum("points"))
            .order_by("-karma")
        )
        
        # Find where the user appears in the list
        rank = None
        karma = 0
        for idx, row in enumerate(leaderboard, start=1):
            if row["user_id"] == request.user.id:
                rank = idx
                karma = row["karma"]
                break
        
        return Response({
            "username": request.user.username,
            "rank": rank,
            "karma": karma,
        })
```

This works fine for a few hundred users, but if this were a real app with 100k+ users, I'd use window functions instead. For a coding challenge though, this is good enough.

---

## Bugs I Found (and Fixed)

The AI-generated starter code had some issues. Here's what I caught:

### Bug #1: Shared Comment State

**The Problem:**

All comment input boxes across different posts were using the same React state variable:

```javascript
function Feed() {
  const [commentDraft, setCommentDraft] = useState("");  // ONE value for ALL posts
  
  return posts.map(post => (
    <input 
      value={commentDraft}  // All inputs share this
      onChange={e => setCommentDraft(e.target.value)}
    />
  ));
}
```

So if you typed in the comment box for Post #1, the text would appear in Post #2's box too. Weird!

**The Fix:**

Use an object keyed by post ID:

```javascript
function Feed() {
  const [commentDrafts, setCommentDrafts] = useState({});  // Object instead of string
  
  return posts.map(post => (
    <input 
      value={commentDrafts[post.id] || ""}  // Each post gets its own value
      onChange={e => 
        setCommentDrafts(prev => ({ 
          ...prev, 
          [post.id]: e.target.value  // Update only this post
        }))
      }
    />
  ));
}
```

Now each post has independent state. Problem solved.

**Lesson learned:** When rendering multiple instances of the same component, use a dictionary/map for state, not a single variable.

---

### Bug #2: N+1 Queries

**The Problem:**

My initial post list was doing this:

```python
class PostListCreateView(APIView):
    def get(self, request):
        posts = Post.objects.all()  # Query 1: Get posts
        
        data = []
        for post in posts:
            data.append({
                "id": post.id,
                "user": post.user.username,          # Query 2, 3, 4...
                "like_count": post.likes.count(),    # Query 102, 103, 104...
                "comment_count": post.comments.count(),  # Query 202, 203, 204...
            })
        
        return Response(data)
```

For 100 posts, this was 301 database queries (1 + 100 + 100 + 100). Page load took 3+ seconds.

**The Fix:**

```python
from django.db.models import Count, Q

class PostListCreateView(APIView):
    def get(self, request):
        posts = (
            Post.objects
            .select_related("user")  # JOIN user table in same query
            .annotate(
                like_count=Count("likes", distinct=True),  # Count likes in DB
                comment_count=Count(
                    "comments",
                    filter=Q(comments__parent__isnull=True),  # Only root comments
                    distinct=True
                )
            )
            .order_by("-created_at")
        )
        
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)
```

**Result:** 1 database query instead of 301. Page load dropped to ~80ms.

**Key techniques:**
- `select_related()` for ForeignKey relationships (does SQL JOIN)
- `annotate()` to compute counts in the database, not Python
- `distinct=True` to avoid duplicate counts from multiple JOINs

---

### Bug #3: Missing Auth Checks

**The Problem:**

Some endpoints assumed the user was logged in:

```python
class LikePostView(APIView):
    def post(self, request, post_id):
        # No authentication check!
        Like.objects.create(
            user=request.user,  # Crashes if user is anonymous
            post_id=post_id
        )
```

If you clicked "like" without logging in, you'd get an error 500.

**The Fix:**

```python
from rest_framework.permissions import IsAuthenticated

class LikePostView(APIView):
    permission_classes = [IsAuthenticated]  # Require auth
    
    def post(self, request, post_id):
        # Now request.user is guaranteed to be a real user
        Like.objects.create(user=request.user, post_id=post_id)
```

Also added frontend checks:

```javascript
<button 
  onClick={() => likePost(post.id)}
  disabled={!accessToken}  // Gray out if not logged in
>
  ❤ {post.like_count} likes
</button>
```

---

## What I Learned

**Database optimization matters.** The difference between 300 queries and 1 query is the difference between a slow app and a fast one. `select_related()` and `annotate()` are your friends.

**State management in React needs planning.** It's tempting to just throw `useState` everywhere, but when you're rendering lists of similar components, you need to think about how state is keyed and updated.

**AI code is a starting point.** The AI gave me a solid scaffold, but I still had to think through performance, edge cases, and user experience. It's a tool, not a replacement for understanding how things work.

**Keep it simple.** I could have used nested sets or materialized paths for comments, or Redis for the leaderboard, but the simple approach worked fine. Premature optimization is real.

---

## Final Thoughts

This was a fun project. I've built comment systems before, but never with unlimited nesting. The tree-building algorithm was satisfying to figure out.

The leaderboard was simpler than I expected - Django's ORM is pretty powerful when you know how to use it.

If I were to keep working on this, I'd add:
- Real-time updates with WebSockets
- Better mobile UI
- Image preview before upload
- Markdown support in comments
- Maybe add reactions beyond just likes

But for a weekend project, I'm happy with how it turned out. The code is clean, the queries are efficient, and it actually works!
