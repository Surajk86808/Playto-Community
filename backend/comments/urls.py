from django.urls import path
from .views import PostCommentsView

urlpatterns = [
    path("post/<int:post_id>/", PostCommentsView.as_view()),
]
