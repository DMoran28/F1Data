from fastapi import FastAPI
import fastf1 as ff1
ff1.Cache.enable_cache("./cache") 

app = FastAPI()

'''
    API endpoint for obtaining the schedule of the official Formula 1 calendar 
    by a given year.
'''
@app.get("/api/schedule/{year}")
async def get_schedule(year):
    # Get the schedule from the FastF1 API.
    schedule = ff1.get_event_schedule(int(year))

    # Get the ID and name of the grand prixes in the schedule.
    gps = [{"id": int(schedule.at[index, "RoundNumber"]), "name": schedule.at[index, "EventName"]} for index in schedule.index if schedule.at[index, "RoundNumber"] != 0]
    
    return {"events": gps}

'''
    API endpoint for obtaining the different sessions (practice, qualifying, race...)
    by a given grand prix.
'''
@app.get("/api/event/{year}/{event}")
async def get_event(year, event):
    # Get the event information from the FastF1 API.
    event = ff1.get_session(int(year), int(event))

    # Get the name of the different sessions.
    sessions = event[["Session1", "Session2", "Session3", "Session4", "Session5"]].tolist()

    return {"name": event["EventName"], "sessions": sessions}

'''
    API endpoint for obtaining the drivers competing in a given session.
'''
@app.get("/api/event/{year}/{event}/{session}")
async def get_session(year, event, session):
    # Get the session information from the FastF1 API.
    session = ff1.get_session(int(year), int(event), session)
    session.load(messages=False)

    # Get the name of the drivers and it's team color.
    drivers = [{"driver": session.results.at[index, "FullName"], "team": session.results.at[index, "TeamColor"]} for index in session.results.index]
    return {"name": session.event["EventName"], "drivers": drivers}