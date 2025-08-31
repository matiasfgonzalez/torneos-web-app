import ListNoticias from "@/components/noticias/ListNoticias";
import { HomeAds } from "@/components/home-ads";
import { VideoAds } from "@/components/video-ads";
import HeroSection from "@/components/index/HeroSection";
import StatsSection from "@/components/index/StatsSection";

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Featured News */}
      <ListNoticias />

      {/* Video Ads Section */}
      <VideoAds variant="featured" />

      {/* Sponsors/Ads Section */}
      <HomeAds variant="carousel" />

      {/* Active Tournaments 
            <ListTorneos />
            */}
    </div>
  );
}
