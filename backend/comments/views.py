from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from posts.models import Post
from .models import Comment

from rest_framework.permissions import IsAuthenticated


class PostCommentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.request.method == "GET":
            return []
        return super().get_permissions()

    def get(self, request, post_id):
        comments = (
            Comment.objects
            .filter(post_id=post_id)
            .select_related("author")
            .order_by("created_at")
        )

        nodes = {}
        roots = []
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

        for node in nodes.values():
            parent_id = node["parent_id"]
            if parent_id and parent_id in nodes:
                nodes[parent_id]["children"].append(node)
            else:
                roots.append(node)

        return Response(roots)

    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        content = request.data.get("content", "").strip()
        parent_id = request.data.get("parent_id")

        if not content:
            return Response({"error": "Content is required"}, status=400)

        parent = None
        if parent_id:
            parent = get_object_or_404(Comment, id=parent_id, post_id=post_id)

        comment = Comment.objects.create(
            post=post,
            author=request.user,
            content=content,
            parent=parent,
        )

        return Response(
            {
                "id": comment.id,
                "content": comment.content,
                "author": comment.author.username,
                "created_at": comment.created_at,
                "parent_id": comment.parent_id,
                "children": [],
            },
            status=201,
        )
