#!/bin/sh
set -e

TOPICS="
orders.order.created
orders.order.confirmed
orders.order.cancelled
orders.order.failed
payments.payment.initiated
payments.payment.confirmed
payments.payment.failed
payments.payment.refunded
inventory.stock.reserved
inventory.stock.released
inventory.stock.updated
inventory.stock.low_alert
fulfillment.task.assigned
fulfillment.task.accepted
fulfillment.task.ready
fulfillment.task.issue_reported
delivery.order.assigned
delivery.location.updated
delivery.order.picked_up
delivery.order.delivered
notifications.whatsapp.send
notifications.push.send
notifications.sms.send
"

for topic in $TOPICS; do
  kafka-topics --bootstrap-server kafka:9092 --create --if-not-exists --topic "$topic" --partitions 1 --replication-factor 1
done
