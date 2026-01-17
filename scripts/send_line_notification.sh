#!/bin/bash
# LINE MCP経由で通知を送信するスクリプト

# 使用方法:
# ./send_line_notification.sh text "メッセージ内容" [userId]
# ./send_line_notification.sh flex "altText" '{"type":"bubble",...}' [userId]

TYPE=$1
shift

case $TYPE in
  text)
    MESSAGE=$1
    USER_ID=${2:-""}
    
    if [ -n "$USER_ID" ]; then
      INPUT_JSON=$(cat <<EOF
{
  "message": {
    "type": "text",
    "text": "$MESSAGE"
  },
  "userId": "$USER_ID"
}
EOF
)
    else
      INPUT_JSON=$(cat <<EOF
{
  "message": {
    "type": "text",
    "text": "$MESSAGE"
  }
}
EOF
)
    fi
    
    echo "Sending text message via LINE MCP..."
    manus-mcp-cli tool call push_text_message --server line --input "$INPUT_JSON"
    ;;
    
  flex)
    ALT_TEXT=$1
    CONTENTS=$2
    USER_ID=${3:-""}
    
    if [ -n "$USER_ID" ]; then
      INPUT_JSON=$(cat <<EOF
{
  "message": {
    "type": "flex",
    "altText": "$ALT_TEXT",
    "contents": $CONTENTS
  },
  "userId": "$USER_ID"
}
EOF
)
    else
      INPUT_JSON=$(cat <<EOF
{
  "message": {
    "type": "flex",
    "altText": "$ALT_TEXT",
    "contents": $CONTENTS
  }
}
EOF
)
    fi
    
    echo "Sending flex message via LINE MCP..."
    manus-mcp-cli tool call push_flex_message --server line --input "$INPUT_JSON"
    ;;
    
  *)
    echo "Usage: $0 [text|flex] ..."
    echo "  text <message> [userId]"
    echo "  flex <altText> <contents_json> [userId]"
    exit 1
    ;;
esac
