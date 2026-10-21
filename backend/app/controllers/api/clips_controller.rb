module Api
  class ClipsController < ApplicationController
    before_action :load_clip, only: %i[show update destroy]

    def index
      clips = Clip.recent_first
      clips = clips.where(status: params[:status]) if params[:status].present?
      clips = clips.where(sport: params[:sport]) if params[:sport].present?
      clips = clips.search_title(params[:search]) if params[:search].present?
      render json: clips.limit(100)
    end

    def show
      render json: @clip
    end

    def create
      clip = Clip.new(clip_params)
      if clip.save
        notify_published(clip) if clip.status == "published"
        render json: clip, status: :created
      else
        render_validation_errors(clip)
      end
    end

    def update
      was_published = @clip.status == "published"
      if @clip.update(clip_params)
        notify_published(@clip) if !was_published && @clip.status == "published"
        render json: @clip
      else
        render_validation_errors(@clip)
      end
    end

    def destroy
      @clip.destroy!
      head :no_content
    end

    private

    def notify_published(clip)
      TelegramNotificationJob.perform_later("FrameSports: published video #{clip.title} (clip ##{clip.id})") if TelegramNotificationService.enabled?
    end


    def load_clip
      @clip = Clip.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Clip not found" }, status: :not_found
    end

    def clip_params
      params.require(:clip).permit(:title, :sport, :status, :views, :duration_seconds, :video_url)
    end

    def render_validation_errors(record)
      render json: { errors: record.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
