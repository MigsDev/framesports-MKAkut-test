require "net/http"
require "json"

class SportsFeedService
  LEAGUES = {
    "4328" => "English Premier League",
    "4335" => "Spanish La Liga",
    "4387" => "NBA",
    "4391" => "NFL",
    "4418" => "Formula 1"
  }.freeze
  CACHE_TTL = 10.minutes

  class ProviderError < StandardError; end
  class InvalidLeague < StandardError; end

  def self.upcoming(league_id)
    id = league_id.to_s
    raise InvalidLeague, "Unsupported league" unless LEAGUES.key?(id)

    Rails.cache.fetch("sportsdb:upcoming:v1:#{id}", expires_in: CACHE_TTL) do
      uri = URI("https://www.thesportsdb.com/api/v1/json/123/eventsnextleague.php")
      uri.query = URI.encode_www_form(id: id)
      response = Net::HTTP.start(uri.host, uri.port, use_ssl: true,
                                 open_timeout: 5, read_timeout: 10) { |http| http.get(uri.request_uri) }
      raise ProviderError, "Fixtures provider returned HTTP #{response.code}" unless response.is_a?(Net::HTTPSuccess)

      data = JSON.parse(response.body)
      raise ProviderError, "Unexpected fixtures payload" unless data.is_a?(Hash)

      Array(data["events"]).first(20).map do |event|
        {
          id: event["idEvent"], title: event["strEvent"],
          home_team: event["strHomeTeam"], away_team: event["strAwayTeam"],
          date: event["dateEvent"], time: event["strTime"],
          sport: event["strSport"], league: event["strLeague"],
          venue: event["strVenue"]
        }
      end
    end
  rescue JSON::ParserError => e
    raise ProviderError, "Invalid fixtures provider response: #{e.message}"
  end
end
