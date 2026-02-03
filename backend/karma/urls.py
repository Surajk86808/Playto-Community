from django.urls import path
from .views import LeaderboardView, LeaderboardMeView

urlpatterns = [
    path("", LeaderboardView.as_view()),
    path("me/", LeaderboardMeView.as_view()),
]
