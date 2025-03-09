from commons.log_helper import get_logger
from commons.abstract_lambda import AbstractLambda
import json
import os

from ..layers.sdk_layer.open_meteo_client import OpenMeteoClient
_LOG = get_logger(__name__)


class ApiHandler(AbstractLambda):

    def validate_request(self, event) -> dict:
        pass
        
    def handle_request(self, event, context):
        """
        AWS Lambda function to handle weather requests.
        """
        # Extract request details
        path = event.get("rawPath", "")
        method = event.get("requestContext", {}).get("http", {}).get("method", "")

        # Validate request
        if path != "/weather" or method != "GET":
            return self.generate_bad_request_response(path, method)

        try:
            # Fetch and return weather data
            weather_data = self.fetch_weather_data()
            return {
                "statusCode": 200,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps(weather_data, indent=4)
            }
        except Exception as e:
            return {
                "statusCode": 500,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"message": f"Internal server error: {str(e)}"})
            }
    def fetch_weather_data(self):
        """
        Fetches weather data from Open-Meteo using the custom SDK.
        """
        client = OpenMeteoClient(latitude=52.52, longitude=13.41)
        raw_data = client.get_weather()
        return self.transform_weather_json(raw_data)

    def transform_weather_json(self,raw_data):
        """
        Extracts and restructures relevant weather data.
        """
        return {
            "latitude": raw_data.get("latitude"),
            "longitude": raw_data.get("longitude"),
            "generationtime_ms": raw_data.get("generationtime_ms"),
            "utc_offset_seconds": raw_data.get("utc_offset_seconds"),
            "timezone": raw_data.get("timezone"),
            "timezone_abbreviation": raw_data.get("timezone_abbreviation"),
            "elevation": raw_data.get("elevation"),
            "hourly_units": raw_data.get("hourly_units"),
            "hourly": raw_data.get("hourly"),
            "current_units": raw_data.get("current_units"),
            "current": raw_data.get("current")
        }

    def generate_bad_request_response(self,path, method):
        """
        Generates a standardized 400 Bad Request response.
        """
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "statusCode": 400,
                "message": f"Bad request syntax or unsupported method. Request path: {path}. HTTP method: {method}"
            })
        }
HANDLER = ApiHandler()


def lambda_handler(event, context):
    return HANDLER.lambda_handler(event=event, context=context)
