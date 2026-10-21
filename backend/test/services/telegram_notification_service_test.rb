require "test_helper"

class TelegramNotificationServiceTest < ActiveSupport::TestCase
  test "does not attempt delivery without configuration" do
    TelegramNotificationService.stub(:enabled?, false) do
      assert_equal false, TelegramNotificationService.deliver("Hello")
    end
  end
end
