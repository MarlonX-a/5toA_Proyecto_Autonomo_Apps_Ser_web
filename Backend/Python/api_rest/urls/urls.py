from django.urls import re_path, include, path
from .. import views
from .api_router import router

urlpatterns = [
    re_path('profile/', views.ProfileView.as_view()),
    path('api/v1/', include(router.urls)),
 ]