const fs = require('fs')
const path = require('path')
const svm = require('node-svm')

//CSVファイルを読み込む
const data = loadCSV('image-train.csv')

//node-svmを利用してデータを学習する
const clf = new svm.CSVC()
clf
    .train(data)
    .progress(progress => {
        console.log('訓練：%d%', Math.round(progress * 100))
    })
    .spread((model, report) => {
        //学習データを保存
        const json = JSON.stringify(model)
        fs.writeFileSync(
            path.join(__dirname, 'database', 'image-model.svm'),
            json)
    })

//CSVファイルを読み込んでnode-svmの形式にする
function loadCSV (fname) {
    const csv = fs.readFileSync(fname, 'utf-8')
    const lines = csv.split('\n')
    const data = lines.map(line => {
        const cells = line.split(',')
        const x = cells.map(v => parseInt(v))
        const label = x.shift()
        return [x, label]
    })
    return data
}