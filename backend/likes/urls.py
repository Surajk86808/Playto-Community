from django.urls import path
from .views import LikePostView, LikeCommentView

urlpatterns = [
    path("post/<int:post_id>/", LikePostView.as_view()),
    path("comment/<int:comment_id>/", LikeCommentView.as_view()),
]
