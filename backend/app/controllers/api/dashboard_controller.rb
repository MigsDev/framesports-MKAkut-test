module Api
  class DashboardController < ApplicationController
    def show
      render json: {
        total_clips: Clip.count,
        published_clips: Clip.where(status: "published").count,
        total_views: Clip.sum(:views),
        by_sport: Clip.group(:sport).count.sort.to_h,
        recent_clips: Clip.recent_first.limit(5)
      }
    end
  end
end
