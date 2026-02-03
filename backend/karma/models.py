from django.db import models
from django.contrib.auth.models import User


class KarmaTransaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    points = models.IntegerField()
    source = models.CharField(max_length=50)  # post_like / comment_like
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.points} karma for {self.user.username}"
