from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils.timezone import now
from datetime import timedelta
from django.db.models import Sum
from rest_framework.permissions import IsAuthenticated

from .models import KarmaTransaction


class LeaderboardView(APIView):

    def get(self, request):
        since = now() - timedelta(hours=24)

        leaderboard = (
            KarmaTransaction.objects
            .filter(created_at__gte=since)
            .values("user__username")
            .annotate(karma=Sum("points"))
            .order_by("-karma")[:5]
        )

        return Response(leaderboard)


class LeaderboardMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        since = now() - timedelta(hours=24)

        leaderboard = (
            KarmaTransaction.objects
            .filter(created_at__gte=since)
            .values("user_id", "user__username")
            .annotate(karma=Sum("points"))
            .order_by("-karma")
        )

        rank = None
        karma = 0
        for idx, row in enumerate(leaderboard, start=1):
            if row["user_id"] == request.user.id:
                rank = idx
                karma = row["karma"]
                break

        return Response({
            "username": request.user.username,
            "rank": rank,
            "karma": karma,
        })
