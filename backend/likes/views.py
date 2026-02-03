from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from django.shortcuts import get_object_or_404

from posts.models import Post
from comments.models import Comment
from .models import Like
from karma.models import KarmaTransaction


from rest_framework.permissions import IsAuthenticated

class LikePostView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)

        with transaction.atomic():
            existing = Like.objects.select_for_update().filter(
                user=request.user, post=post
            ).first()

            if existing:
                existing.delete()
                KarmaTransaction.objects.create(
                    user=post.user,
                    points=-5,
                    source="post_unlike"
                )
                like_count = Like.objects.filter(post=post).count()
                return Response({"message": "Post unliked", "liked": False, "like_count": like_count})

            Like.objects.create(user=request.user, post=post)
            KarmaTransaction.objects.create(
                user=post.user,
                points=5,
                source="post_like"
            )
            like_count = Like.objects.filter(post=post).count()
            return Response({"message": "Post liked", "liked": True, "like_count": like_count})


class LikeCommentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, comment_id):
        comment = get_object_or_404(Comment, id=comment_id)

        with transaction.atomic():
            existing = Like.objects.select_for_update().filter(
                user=request.user, comment=comment
            ).first()

            if existing:
                existing.delete()
                KarmaTransaction.objects.create(
                    user=comment.author,
                    points=-1,
                    source="comment_unlike"
                )
                like_count = Like.objects.filter(comment=comment).count()
                return Response({"message": "Comment unliked", "liked": False, "like_count": like_count})

            Like.objects.create(user=request.user, comment=comment)
            KarmaTransaction.objects.create(
                user=comment.author,
                points=1,
                source="comment_like"
            )
            like_count = Like.objects.filter(comment=comment).count()
            return Response({"message": "Comment liked", "liked": True, "like_count": like_count})
