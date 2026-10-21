require "net/http"
require "json"

class TelegramNotificationService
  ENDPOINT = "https://api.telegram.org".freeze

  def self.enabled?
    ENV["TELEGRAM_BOT_TOKEN"].to_s.strip != "" && ENV["TELEGRAM_CHAT_ID"].to_s.strip != ""
  end

  def self.deliver(message)
    return false unless enabled?

    token = ENV.fetch("TELEGRAM_BOT_TOKEN")
    chat = ENV.fetch("TELEGRAM_CHAT_ID")
    uri = URI("#{ENDPOINT}/bot#{token}/sendMessage")
    request = Net::HTTP::Post.new(uri)
    request.set_form_data(chat_id: chat, text: message.to_s.slice(0, 4000))

    response = Net::HTTP.start(uri.host, uri.port, use_ssl: true,
                               open_timeout: 5, read_timeout: 10) { |http| http.request(request) }
    raise "Telegram delivery failed (HTTP #{response.code})" unless response.is_a?(Net::HTTPSuccess)

    payload = JSON.parse(response.body)
    raise "Telegram rejected notification" unless payload["ok"] == true
    true
  end
end
