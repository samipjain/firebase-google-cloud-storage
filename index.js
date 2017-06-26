const functions = require('firebase-functions')
const gcs = require('@google-cloud/storage')()
const spawn = require('child-process-promise').spawn

exports.generateThumbnail = functions.storage.object()
    .onChange(event => {
        const object = event.data
        const filePath = object.name
        const fileName = filePath.split('/').pop()
        const fileBucket = object.bucket
        const bucket = gcs.bucket(fileBucket)
        const tempFilePath = `/tmp/${fileName}`

        if (fileName.startsWith('thumb_')) {
            console.log('Already a Thumbnail.')
            return
        }

        if (!object.contentType.startsWith('image/')) {
            console.log('This is not an image')
            return
        }

        if (object.resourceState === 'not_exists') {
            console.log('This is a deletion event')
            return
        }
        /*
        return 
        bucket.file(filePath).download({
            .then(// download the image)
            .then(// resize the image)
            .then(// write image to storage)
        })
        */

        return bucket.file(filePath).download({
            destination: tempFilePath
        })
        .then(() => {
            console.log('Image downloaded locally to', tempFilePath)
            return spawn('convert', [tempFilePath, '-thumbnail', '200x200>', tempFilePath])
        })
        .then(() => {
            console.log('Thumbnail created')
            const thumbFilePath = filePath.replace(/(\/)?([^\/]*)$/, '$1thumb_$2')

            return bucket.upload(tempFilePath, {
                destination: thumbFilePath
            })
        })
    })


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Samip Jain!");
//  console.log('helloWorld function triggered!');
// });
/*
exports.sanitizePost = functions.database
    .ref('/posts/{pushId}')
    .onWrite(event => {
        // 2 properties - event.params & event.data (Delta Snapshot)
        // event.data  - (Properties)
        // key: '-Kg8CZTEnuZdDjEovzZX'
        // ref: [Reference]
        // adminRef: [Reference]

        // Methods - 
        // child(), exists(), forEach(), val()
        // val() - Returns all the data inside the Delta Snapshot as a Javascript object 
        const post = event.data.val()
        if (post.sanitized) {
            return
        }
        console.log("Sanitizing new post " + event.params.pushId)
        console.log(post)
        post.sanitized = true
        post.title = sanitize(post.title)
        post.body = sanitize(post.body)
        return event.data.ref.set(post)
        
        // OR 
        // const promise = event.data.ref.set(post)
        // return promise
    })

    function sanitize(s) {
        var sanitizedText = s
        sanitizedText = sanitizedText.replace(/\bstupid\b/ig, "wonderful")
        return sanitizedText
    }
*/

