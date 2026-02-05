from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Post
from .serializers import PostSerializer
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404

class PostListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.request.method == "GET":
            return []
        return super().get_permissions()

    def get(self, request):
        limit = request.query_params.get("limit", "10")
        try:
            limit = max(1, min(int(limit), 50))
        except ValueError:
            limit = 10

        posts = (
            Post.objects
            .select_related("user")
            .annotate(
                like_count=Count("likes", distinct=True),
                comment_count=Count("comments", filter=Q(comments__parent__isnull=True), distinct=True),
            )
            .order_by("-created_at")[:limit]
        )
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)

    def post(self, request):
        image = request.FILES.get("image")
        content = request.data.get("content", "")

        if not image and not content:
            return Response(
                {"error": "Content or image is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        post = Post.objects.create(user=request.user, content=content, image=image)
        serializer = PostSerializer(post)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PostImageDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        if post.user != request.user:
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        if post.image:
            post.image.delete(save=False)
            post.image = None
            post.save(update_fields=["image"])
        return Response(status=status.HTTP_204_NO_CONTENT)
