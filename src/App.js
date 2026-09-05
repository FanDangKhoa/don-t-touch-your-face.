import "./App.css";
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";
import { Howl } from "howler";
import soundFile from "./assets/sound.mp3";
import React, { useEffect, useRef } from "react";
var sound = new Howl({
  src: [soundFile],
});

sound.play();

const NOT_TOUCH_label = "NOT_TO_TOUCH";
const TOUCH_label = "TOUCH";
const TRAINING_ITERATIONS = 50;

function App() {
  const videoRef = useRef();
  const init = async () => {
    console.log("Initializing...");
    await setupCamera();
    console.log("Camera setup complete.");
    const mobilenet = require("@tensorflow-models/mobilenet");
    const knnClassifier = require("@tensorflow-models/knn-classifier");

    const model = await mobilenet.load();

    // Create the classifier.
    const classifier = knnClassifier.create();
  };
  const setupCamera = async () => {
    return new Promise((resolve, reject) => {
      navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;
      if (navigator.getUserMedia) {
        navigator.getUserMedia(
          { video: true },
          (stream) => {
            videoRef.current.srcObject = stream;
            videoRef.current.addEventListener("loadeddata", () => {
              resolve();
            });
          },
          (err) => {
            console.error("Error accessing webcam: ", err);
            reject(err);
          },
        );
      } else {
        console.error("getUserMedia not supported in this browser.");
        reject(new Error("getUserMedia not supported"));
      }
    });
  };
  const train = async (label) => {
    for (let i = 0; i < TRAINING_ITERATIONS; ++i) {
      console.log(
        `Progress: ${parseInt(((i + 1) / TRAINING_ITERATIONS) * 100)}%`,
      );
      await sleep(100); // Simulate delay
    }
  };

  const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  useEffect(() => {
    init();
    return () => {
      // Cleanup code here
    };
  }, []);

  return (
    <div className="main">
      <video className="video" autoPlay ref={videoRef} />
      <div className="controls">
        <button
          className="control-button"
          onClick={() => train(NOT_TOUCH_label)}>
          Train Not Touch
        </button>
        <button className="control-button" onClick={() => train(TOUCH_label)}>
          Train Touch
        </button>
        <button className="control-button" onClick={() => sound.stop()}>
          Train
        </button>
      </div>
    </div>
  );
}
export default App;
