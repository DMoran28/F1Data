from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from datetime import datetime
import fastf1 as ff1
import pandas as pd

ff1.Cache.enable_cache("./cache")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

"""
    API endpoint for obtaining the schedule of the official Formula 1 calendar
    by a given year.
"""
@app.get("/api/schedule/{year}")
async def get_schedule(year):
    # Get the schedule from the FastF1 API.
    schedule = ff1.get_event_schedule(int(year))

    # Get the ID and name of the grand prixes in the schedule.
    gps = [
        {
            "id": int(schedule.at[index, "RoundNumber"]),
            "value": schedule.at[index, "EventName"],
        }
        for index in schedule.index 
        if datetime.now() > schedule.at[index, "Session1Date"] 
        and schedule.at[index, "RoundNumber"] != 0
    ]

    return list(reversed(gps))


"""
    API endpoint for obtaining the different sessions (practice, qualifying,
    race, etc.) by a given Grand Prix.
"""
@app.get("/api/schedule/{year}/{event}")
async def get_event(year, event):
    # Get the event information from the FastF1 API.
    event = ff1.get_session(int(year), event)

    # Get the name of the different sessions.
    sessions = event[
        ["Session1", "Session2", "Session3", "Session4", "Session5"]
    ].tolist()
    dates = event[[
        "Session1Date", 
        "Session2Date", 
        "Session3Date", 
        "Session4Date",
        "Session5Date"
    ]].tolist()
    sessions = [
        {"id": index + 1, "value": session} 
        for index, session in enumerate(sessions)
        if datetime.now() > dates[index]
    ]

    return list(reversed(sessions))


"""
    API endpoint for obtaining the drivers competing in a given session.
"""
@app.get("/api/schedule/{year}/{event}/{session}")
async def get_session(year, event, session):
    # Get the session information from the FastF1 API.
    session = ff1.get_session(int(year), event, session)
    session.load(messages=False)

    # Get the name of the drivers.
    drivers = [
        {"id": i + 1, "value": session.results.at[index, "FullName"]}
        for i, index in enumerate(session.results.index)
    ]
    return drivers

"""
    API endpoint for obtaining the laptime of a given driver in a given session.
"""
@app.get("/api/schedule/{year}/{event}/{session}/{driver}")
async def get_driver(year, event, session, driver):
    # Get the driver information from the FastF1 API.
    session = ff1.get_session(int(year), event, session)
    session.load(messages=False)

    # Get the laptime of the driver.
    driver_number = session.results.loc[
        session.results["FullName"] == driver, "DriverNumber"
    ].values[0]
    data = session.laps.pick_driver(driver_number)[["LapNumber", "LapTime"]]

    return {
        "labels": data["LapNumber"].tolist(), 
        "scores": data["LapTime"].tolist(),
        "driver": driver,
        "color": session.results.loc[
            session.results["DriverNumber"] == driver_number, "TeamColor"
        ].values[0]
    }

"""
    API endpoint to get the telemetry of a given driver in a given session.
"""
@app.get("/api/telemetry/{year}/{event}/{session}/{driver}/{lap}/{tel_type}")
async def get_telemetry(year, event, session, driver, lap, tel_type):
    # Get the driver information from the FastF1 API.
    session = ff1.get_session(int(year), event, session)
    session.load(messages=False)

    # Get the laptime of the driver.
    driver_number = session.results.loc[
        session.results["FullName"] == driver, "DriverNumber"
    ].values[0]
    laps = session.laps.pick_driver(driver_number)
    data = laps[
        laps["LapNumber"] == int(lap)
    ].iloc[0].get_telemetry()[[tel_type, "Distance"]]
    data["Distance"] = round(data["Distance"])

    return {
        "labels": data["Distance"].tolist(), 
        "scores": data[tel_type].tolist(),
        "driver": driver,
        "color": session.results.loc[
            session.results["DriverNumber"] == driver_number, "TeamColor"
        ].values[0]
    }