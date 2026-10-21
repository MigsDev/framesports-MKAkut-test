require "test_helper"

class Api::ClipCommentsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @clip = Clip.create!(title: "Goal", sport: "Football", status: "published", views: 0, duration_seconds: 60)
  end

  test "create and list feedback" do
    # Keep external Telegram configuration out of this controller test.
    TelegramNotificationService.stub(:enabled?, false) do
      assert_difference("ClipComment.count", 1) do
      post "/api/clips/#{@clip.id}/comments", params: { comment: { author: "Viewer", body: "Great finish", rating: 5, kind: "comment" } }, as: :json
    end
    end
    assert_response :created
    get "/api/clips/#{@clip.id}/comments"
    assert_response :success
    assert_equal 5, response.parsed_body["average_rating"].to_i
    assert_equal "Great finish", response.parsed_body["comments"].first["body"]
  end

  test "rejects blank feedback" do
    post "/api/clips/#{@clip.id}/comments", params: { comment: { author: "", body: "", rating: 9 } }, as: :json
    assert_response :unprocessable_entity
  end
end
