from rest_framework import serializers
from .models import Comment


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source="author.username", read_only=True)
    children = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ["id", "content", "author", "created_at", "children"]

    def get_children(self, obj):
        children = obj.children.all()
        return CommentSerializer(children, many=True).data
