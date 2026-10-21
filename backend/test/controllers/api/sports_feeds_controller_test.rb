require "test_helper"

class Api::SportsFeedsControllerTest < ActionDispatch::IntegrationTest
  test "returns fixtures from the feed service" do
    fixture = { id: "1", title: "Team A vs Team B", date: "2026-11-01" }
    SportsFeedService.stub(:upcoming, [fixture]) do
      get "/api/sports_feeds", params: { league: "4328" }
      assert_response :success
      assert_equal "English Premier League", response.parsed_body["league"]
      assert_equal "1", response.parsed_body["fixtures"].first["id"]
    end
  end

  test "rejects unsupported leagues" do
    get "/api/sports_feeds", params: { league: "not-a-league" }
    assert_response :unprocessable_entity
  end
end
