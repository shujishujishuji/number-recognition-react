//  文字認識サーバー
const path = require('path')
const fs = require('fs')

//定数定義
const SVM_MODEL = path.join(__dirname, 'database', 'image-model.svm')
const portNo = 3001

//webサーバの起動
const express = require('express')
const app = express()
app.listen(portNo, () => {
    console.log('起動しました', `http://localhost:${portNo}`)
})

//学習モデるの読み込み
const svm = require('node-svm')
const modelJSON = fs.readFileSync(SVM_MODEL, 'utf-8')
const model = JSON.parse(modelJSON)
const clf = svm.restrore(model)

//API定義
app.get('/api/predict', (req, res) => {
    const px = req.query.px
    if (!px) {
        res.json({status: false})
        return
    }
    const pxa = px.split('').map(v => parseInt('0x' + v) * 16)
    console.log('受信：', pxa.join(':'))
    clf.predict(pxa).then((label) => {
        res.json({status: true, label})
        console.log('分類：', label)
    })
})

//静的ファイルの送出
app.use('/', express.static('./public'))