from django.db import models
from django.contrib.auth.models import User
from posts.models import Post
from comments.models import Comment


class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="likes")
    post = models.ForeignKey(Post, null=True, blank=True, on_delete=models.CASCADE, related_name="likes")
    comment = models.ForeignKey(Comment, null=True, blank=True, on_delete=models.CASCADE, related_name="likes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "post"],
                name="unique_user_post_like"
            ),
            models.UniqueConstraint(
                fields=["user", "comment"],
                name="unique_user_comment_like"
            ),
        ]

    def __str__(self):
        return f"Like by {self.user.username}"
