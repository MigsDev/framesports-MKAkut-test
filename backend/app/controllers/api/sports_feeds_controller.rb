module Api
  class SportsFeedsController < ApplicationController
    def index
      league_id = params.fetch(:league, "4328").to_s
      fixtures = SportsFeedService.upcoming(league_id)
      render json: {
        league_id: league_id,
        league: SportsFeedService::LEAGUES.fetch(league_id),
        fixtures: fixtures,
        source: "TheSportsDB v1 (free; upcoming schedules only)"
      }
    rescue SportsFeedService::InvalidLeague => e
      render json: { error: e.message }, status: :unprocessable_entity
    rescue SportsFeedService::ProviderError, Timeout::Error, SocketError,
           Errno::ECONNREFUSED, OpenSSL::SSL::SSLError => e
      Rails.logger.warn("Sports feed error: #{e.class}: #{e.message}")
      render json: { error: "Upcoming fixtures are temporarily unavailable" }, status: :bad_gateway
    end
  end
end
