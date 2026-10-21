module Api
  class ClipCommentsController < ApplicationController
    before_action :load_clip

    def index
      comments = @clip.clip_comments.order(created_at: :desc, id: :desc).limit(100)
      render json: {
        comments: comments,
        average_rating: @clip.clip_comments.where.not(rating: nil).average(:rating)&.round(1),
        rating_count: @clip.clip_comments.where.not(rating: nil).count
      }
    end

    def create
      comment = @clip.clip_comments.new(comment_params)
      if comment.save
        if TelegramNotificationService.enabled?
          summary = comment.kind == "issue" ? "Playback issue reported" : "New viewer comment"
          TelegramNotificationJob.perform_later("FrameSports: #{summary} on #{@clip.title} (clip ##{@clip.id}) by #{comment.author}: #{comment.body.truncate(300)}")
        end
        render json: comment, status: :created
      else
        render json: { errors: comment.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

    def load_clip
      @clip = Clip.find(params[:clip_id])
    end

    def comment_params
      params.require(:comment).permit(:author, :body, :rating, :kind)
    end
  end
end
