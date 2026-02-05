from django.urls import path
from .views import PostListCreateView, PostImageDeleteView

urlpatterns = [
    path("", PostListCreateView.as_view(), name="post-list-create"),
    path("<int:post_id>/image/", PostImageDeleteView.as_view(), name="post-image-delete"),
]
