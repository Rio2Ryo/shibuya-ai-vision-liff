#!/bin/bash
# LINE MCP通知スクリプト
# 使用方法: ./line_mcp_notification.sh <action> <user_id> <message_json_file>

ACTION=$1
USER_ID=$2
MESSAGE_FILE=$3

case $ACTION in
  "text")
    # テキストメッセージを送信
    MESSAGE=$(cat "$MESSAGE_FILE")
    manus-mcp-cli tool call push_text_message --server line --input "{\"user_id\": \"$USER_ID\", \"text\": \"$MESSAGE\"}"
    ;;
  
  "flex")
    # Flex Messageを送信
    FLEX_CONTENT=$(cat "$MESSAGE_FILE")
    manus-mcp-cli tool call push_flex_message --server line --input "{\"user_id\": \"$USER_ID\", \"message\": $FLEX_CONTENT}"
    ;;
  
  "broadcast")
    # ブロードキャストメッセージを送信
    MESSAGE=$(cat "$MESSAGE_FILE")
    manus-mcp-cli tool call broadcast_text_message --server line --input "{\"text\": \"$MESSAGE\"}"
    ;;
  
  *)
    echo "Usage: $0 <text|flex|broadcast> <user_id> <message_file>"
    exit 1
    ;;
esac
