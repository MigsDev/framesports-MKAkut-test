class TelegramNotificationJob < ApplicationJob
  queue_as :default

  def perform(message)
    TelegramNotificationService.deliver(message)
  rescue StandardError => e
    Rails.logger.warn("Telegram notification failed: #{e.class}: #{e.message}")
    # Never prevent video publishing or feedback submission if Telegram is unavailable.
  end
end
