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
  test "playing a clip increments its views exactly once per request" do
    clip = Clip.create!(title: "Views test", sport: "Football", status: "published",
                        duration_seconds: 60, views: 3)

    post "/api/clips/#{clip.id}/view", as: :json
    assert_response :success
    assert_equal({ "id" => clip.id, "views" => 4 }, response.parsed_body)
    assert_equal 4, clip.reload.views

    post "/api/clips/#{clip.id}/view", as: :json
    assert_response :success
    assert_equal 5, response.parsed_body["views"]

    get "/api/dashboard"
    assert_response :success
    assert_equal Clip.sum(:views), response.parsed_body["total_views"]
  end

  test "view endpoint returns not found for a missing clip" do
    post "/api/clips/999999999/view", as: :json
    assert_response :not_found
    assert_equal "Clip not found", response.parsed_body["error"]
  end

  test "editing a clip cannot overwrite recorded views" do
    clip = Clip.create!(title: "Protected views", sport: "Tennis", status: "published",
                        duration_seconds: 60, views: 8)
    patch "/api/clips/#{clip.id}", params: { clip: { title: "Updated title", views: 0 } }, as: :json
    assert_response :success
    assert_equal "Updated title", clip.reload.title
    assert_equal 8, clip.views
  end

end
