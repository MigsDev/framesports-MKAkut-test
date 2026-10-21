require "test_helper"

class Api::ClipsControllerTest < ActionDispatch::IntegrationTest
  test "creates and lists a clip" do
    assert_difference("Clip.count", 1) do
      post "/api/clips", params: { clip: { title: "Test goal", sport: "Football", status: "draft", views: 0, duration_seconds: 30 } }, as: :json
    end
    assert_response :created
    get "/api/clips", params: { search: "Test goal" }
    assert_response :success
    assert_equal "Test goal", response.parsed_body.first["title"]
  end

  test "rejects invalid clip" do
    post "/api/clips", params: { clip: { title: "", sport: "Football", duration_seconds: -1 } }, as: :json
    assert_response :unprocessable_entity
    assert response.parsed_body["errors"].any?
  end
end
