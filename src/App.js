import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";
import { Howl } from "howler";
import soundFile from "./assets/sound.mp3";
import "./App.css";

import React, { useEffect, useRef, useState } from "react";
var sound = new Howl({
  src: [soundFile],
});

sound.play();

const NOT_TOUCH_label = "NOT_TO_TOUCH";
const TOUCH_label = "TOUCH";
const TRAINING_ITERATIONS = 50;

function App() {
  const videoRef = useRef();
  const classifierRef = useRef();
  const modelRef = useRef();

  const [touched, setTouched] = useState(false);
  const init = async () => {
    console.log("Initializing...");
    await setupCamera();
    console.log("Camera setup complete.");
    const mobilenet = require("@tensorflow-models/mobilenet");
    const knnClassifier = require("@tensorflow-models/knn-classifier");

    modelRef.current = await mobilenet.load();

    // Create the classifier.
    classifierRef.current = knnClassifier.create();
    console.log("Set up Done.");

    console.log("Không chạm tay lên mặt và Bấm Train 1.");
  };

  const setupCamera = () => {
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
    console.log(`Training for label: ${label}`);
    for (let i = 0; i < TRAINING_ITERATIONS; ++i) {
      console.log(
        `Progress: ${parseInt(((i + 1) / TRAINING_ITERATIONS) * 100)}%`,
      );
      await training(label); // Simulate delay
    }
  };
  const training = (label) => {
    return new Promise(async (resolve) => {
      const embeddings = modelRef.current.infer(videoRef.current, true);

      classifierRef.current.addExample(embeddings, label);
      await sleep(100); // Simulate delay
      resolve();
    });
  };
  const run = async () => {
    const embeddings = modelRef.current.infer(videoRef.current, true);
    const result = await classifierRef.current.predictClass(embeddings);
    console.log("Label: ", result.label);
    console.log("Confidence: ", result.confidences);
    if (result.label === TOUCH_label && result.confidences[TOUCH_label] > 0.8) {
      setTouched(true);
      sound.play();
    } else {
      setTouched(false);
    }
    run();
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
    <div className={`main ${touched ? "touched" : ""}`}>
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
        <button className="control-button" onClick={() => run()}>
          Run
        </button>
      </div>
    </div>
  );
}
export default App;
