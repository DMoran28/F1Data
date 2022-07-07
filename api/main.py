from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from datetime import datetime
import fastf1 as ff1
import pandas as pd
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler
import json
import numpy as np

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
    This function gives to every circuit of the dataset a unique identifier.
"""
def check_circuit(circuit):
    with open("datasets/auxiliar_data.json", 'r', encoding="utf8") as file:
        data= json.load(file)
    return next(
        item["id"] for item in data["circuits"] if item["name"] == circuit
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
    color = session.results.loc[
        session.results["DriverNumber"] == driver_number, "TeamColor"
    ].values[0]

    return {
        "labels": data["LapNumber"].tolist(), 
        "items": [{
            "label": driver,
            "data": data["LapTime"].tolist(),
            "tension": 0.3,
            "borderColor": color,
            "backgroundColor": color
        }]
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
    color = session.results.loc[
        session.results["DriverNumber"] == driver_number, "TeamColor"
    ].values[0]
    return {
        "labels": data["Distance"].tolist(), 
        "items": [{
            "label": driver,
            "data": data[tel_type].tolist(),
            "tension": 0.3,
            "borderColor": color,
            "backgroundColor": color
        }]
    }


"""
    API endpoint that returns the circuits (with an identifier) that can be
    analyzed and evaluated by the trained model.
"""
@app.get("/api/prediction")
def get_prediction():
    # Get the auxiliar data from the JSON file to obtain the circuits that
    # can be analyzed with the trained model.
    with open("datasets/auxiliar_data.json", "r", encoding="utf8") as file:
        data = json.load(file)

    return [item for item in data["circuits"] if item["id"] > 15]

"""
    API endpoint that evaluate the qualifying results by using the trained
    model made in the project. This model can be either with tracks grouped
    in 2 clusters or grouped in 5 clusters.
"""
@app.get("/api/prediction/{event}/{cluster}")
def get_prediction(event, cluster):
    # Load the trained model to evaluate the dataframe and the scaler to
    # normalize the data.  
    class_names = ["with points", "without points"]
    model = tf.keras.models.load_model(f"models/model{cluster}")

    # Get the data without any transformation to compare at the end of the
    # evaluation of the trained model.
    drivers = pd.read_csv("datasets/drivers_dataset.csv", header=0, index_col=0)
    drivers["GrandPrix"] = drivers["GrandPrix"].apply(check_circuit)
    test_drivers = drivers.drop(
        drivers.loc[drivers["GrandPrix"] <= 15].index
    ).reset_index(drop=True)
    test_drivers = test_drivers.loc[
        test_drivers["GrandPrix"] == check_circuit(event)
    ]

    # Get the normalized data to evaluate the trained model.
    normalized = pd.read_csv(
        f"datasets/normalized{cluster}.csv", header=0, index_col=0
    )
    test = normalized.drop(
        normalized.loc[normalized["GrandPrix"] <= 0.8].index
    ).reset_index(drop=True)
    test.pop("RacePos")

    # Evaluate the neural network model with 2 or 5 clusters and make the 
    # prediction.
    prediction = model.predict(test)

    data_points, labels_points, data_npoints, labels_npoints = [], [], [], []
    for index, pred in enumerate(prediction):
        if index in test_drivers.index:
            # Class: With points (0).
            if np.argmax(pred) == 0:
                data_points.append(100 * np.max(pred))
                labels_points.append(test_drivers.at[index, "Driver"])
            # Class: Without points (1).
            else:
                data_npoints.append(100 * np.max(pred))
                labels_npoints.append(test_drivers.at[index, "Driver"])
    
    
    return {
        "itemsPoints": [{
            "data": data_points,
            "backgroundColor": "#dd0000",
            "borderColor": "rgba(221,0,0,0.7)"
        }],
        "labelsPoints": labels_points,
        "itemsNPoints": [{
            "data": data_npoints,
            "backgroundColor": "white",
            "borderColor": "rgba(255,255,255,0.7)"
        }],
        "labelsNPoints": labels_npoints
    }


"""
    API endpoint for obtaining the schedule of the official Formula 1 calendar
    by a given season. It only returns those grand prix that have finished,
    including all the sessions availables.
"""
@app.get("/api/stats/{year}")
async def get_schedule_stats(year):
    # Get the schedule from the FastF1 API.
    schedule = ff1.get_event_schedule(int(year))

    # Get the ID and name of the grand prixes in the schedule.
    gps = [
        {
            "id": int(schedule.at[index, "RoundNumber"]),
            "value": schedule.at[index, "EventName"],
        }
        for index in schedule.index 
        if datetime.now() > schedule.at[index, "Session5Date"] 
        and schedule.at[index, "RoundNumber"] != 0
    ]

    return list(reversed(gps))


"""
    This API endpoint will return various stats of a grand prix by a given 
    season. The stats will vary between qualifying times of every driver, race strategies of every driver (compounds), points obtained in the race and
    the championship points until that race.
"""
@app.get("/api/stats/{year}/{event}")
def get_stats(year, event):
    season = int(year) # Season of Fórmula 1 to gather the data.

    # Qualifying data to gather all the stats.
    qualifying = ff1.get_session(season, event, 'Q')
    qualifying.load(weather=False, messages=False)

    # Race session data to gather all the stats. 
    race = ff1.get_session(season, event, 'R')
    race.load(weather=False, messages=False)

    # Get the laptime of every driver and save the data.
    items, labels, colors = [], [], []
    for driver in qualifying.results.index:
        labels.append(qualifying.results.at[driver, "FullName"])
        colors.append(qualifying.results.at[driver, "TeamColor"])
        lap = qualifying.laps.pick_driver(driver).pick_fastest()
        items.append(lap["LapTime"].total_seconds())
    
    quali_times = {
        "items": [{
            "data": items,
            "backgroundColor": colors
        }],
        "labels": labels,
    }

    # Get the stint duration of every driver.
    driver_stints = race.laps[
        ["DriverNumber", "Stint", "Compound", "LapNumber"]
    ].groupby(["DriverNumber", "Stint", "Compound"]).count().reset_index()
    driver_stints = driver_stints.rename(columns={"LapNumber": "Length"})
    driver_stints["Stint"] = driver_stints["Stint"].astype("int64")

    compound_colors = {
        "SOFT": "#FF3333",
        "MEDIUM": "#FFF200",
        "HARD": "#EBEBEB",
        "INTERMEDIATE": "#39B54A",
        "WET": "#00AEEF",
        "UNKNOWN": "gray"
    }

    labels = []
    for index in race.results.index:
        labels.append(race.results.at[index, "FullName"])
    
    items = []
    for stint in range(0, driver_stints["Stint"].max()):
        data, colors = [], []
        for index, driver in enumerate(race.results.index):
            stints = driver_stints.loc[
                driver_stints["DriverNumber"] == driver 
            ].reset_index(drop=True)

            if stint in stints.index:
                compound = stints.at[stint, "Compound"]
                colors.append(compound_colors[compound])
                data.append(int(stints.at[stint, "Length"]))
            else:
                data.append(0)
                colors.append("gray")
        
        items.append({
            "data": data,
            "backgroundColor": colors,
            "borderColor": "black"
        })
    
    race_strat = {
        "laps": int(race.laps["LapNumber"].max()),
        "items": items,
        "labels": labels
    }

    # Get the championship points of every driver:
    schedule = ff1.get_event_schedule(season)

    races, labels, drivers = [], [], set()
    for index in schedule.index:
        if schedule.at[index, "RoundNumber"] != 0: 
            labels.append(schedule.at[index, "Location"])
            race = ff1.get_session(
                season, schedule.at[index, "RoundNumber"], 'R'
            )
            race.load(
                laps=False, telemetry=False, weather=False, messages=False
            )
            races.append(race)

            for driver in race.drivers:
                drivers.add(driver)
        if schedule.at[index, "EventName"] == event: break
    
    items = []
    for driver in drivers:
        data, prev = [], 0
        for race in races:
            result = race.results.loc[race.results["DriverNumber"] == driver]
            if not result.empty:
                points = int(result["Points"].tolist()[0]) + prev
                name = result["FullName"].tolist()[0]
                color = result["TeamColor"].tolist()[0]
            else:
                points = 0 + prev
            prev = points
            data.append(points)
        items.append({
            "data": data,
            "borderColor": color,
            "backgroundColor": color,
            "label": name
        })
    
    cham_points = {
        "items": items,
        "labels": labels
    }

    return {
        "qualiTimes": quali_times,
        "raceStrat": race_strat,
        "chamPoints": cham_points
    }