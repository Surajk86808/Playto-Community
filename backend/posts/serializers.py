from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source="user.username", read_only=True)
    created_at = serializers.SerializerMethodField()
    like_count = serializers.IntegerField(read_only=True)
    comment_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Post
        fields = ["id", "user", "content", "image", "created_at", "like_count", "comment_count"]

    def get_created_at(self, obj):
        return obj.created_at.strftime("%d %b %Y, %I:%M %p")
