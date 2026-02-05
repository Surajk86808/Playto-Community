from rest_framework import serializers
from cloudinary.utils import cloudinary_url
from .models import Post


class PostSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source="user.username", read_only=True)
    created_at = serializers.SerializerMethodField()
    like_count = serializers.IntegerField(read_only=True)
    comment_count = serializers.IntegerField(read_only=True)

    # ⭐ IMPORTANT
    image = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "user",
            "content",
            "image",
            "created_at",
            "like_count",
            "comment_count",
        ]

    def get_created_at(self, obj):
        return obj.created_at.strftime("%d %b %Y, %I:%M %p")

    # ⭐ THIS FIXES YOUR IMAGE PROBLEM
    def get_image(self, obj):
        if not obj.image:
            return None
        # CloudinaryField typically provides .url, but handle edge cases safely.
        if hasattr(obj.image, "url"):
            return obj.image.url
        try:
            url, _ = cloudinary_url(str(obj.image), secure=True)
            return url
        except Exception:
            return None
