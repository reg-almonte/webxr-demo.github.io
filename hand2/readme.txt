How To Use:

1. Use open hand to control/navigate the cursor (blue ring object)

2. Put the curson on the sphere object (The sphere will resize)

3. Close the hand to grab the sphere object (The sphere and cursor will change size)

4. Move hand around while hand is still closed

5. Open hand to release the object


Limitation:

1. The sample app works properly on iMAC (desktop)

2. To use on phone, comment out the following line in "hand-ar.js"

line 90: model.renderPredictions(predictions, canvas, context, cameraView);

-- This will not render the camera view, which limits the user to see if hand is properly detected by the app.



