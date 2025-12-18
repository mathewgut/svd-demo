# SVD Image Compression
Using the Singular Value Decompisition formula, we are able to compress an image by converting it into RGB matrices and shortening "noise" or unfrequent patterns based on the count of rank.

# Use Warnings
Limit images to 500x500 in size as any bigger will result in hangups and exorbinant wait times for compression. Assuming rank = min(x,y) you will be creating and performing operations on 9 matrices holding somewhere around 250000 values each. 

If you expierence hangups or long wait times while under or equal to 500x500, try uploading a different image. Some cause issues with compression. Recommended formats are PNG and JPG.


# Running the project

You can view this project at https://svd.mgut.ca

Alternatively you can view this project as a localhost by following these steps:

1. Clone the repository into a folder on to your computer with:

```
git clone https://github.com/mathewgut/svd-demo.git

```
2. Open a terminal at the directory of the cloned repo and enter the following:
   i. you can install NPM [here](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) if you don't already have it

```
npm i
npm run dev
```

3. You will then see a link in the terminal output, CTRL + Left Click on the link will open the preview in your browser.
