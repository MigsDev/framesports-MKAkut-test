require "test_helper"

class ClipTest < ActiveSupport::TestCase
  test "rejects invalid video url" do
    clip = Clip.new(title: "Goal", sport: "Football", status: "draft", views: 0, duration_seconds: 20, video_url: "javascript:alert(1)")
    assert_not clip.valid?
    assert_includes clip.errors[:video_url].join, "HTTP(S)"
  end

  test "accepts valid record" do
    clip = Clip.new(title: "Goal", sport: "Football", status: "draft", views: 0, duration_seconds: 20)
    assert clip.valid?
  end
end
