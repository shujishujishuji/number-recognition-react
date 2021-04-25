const fs = require('fs')
const path = require('path')

//変換
convertToCSV(path.join(__dirname, 'database'))

function convertToCSV (dbdir) {
    // ファイル名の指定
    const imbFile = path.join(dbdir, 'images-idx3')
    const lblFile = path.join(dbdir, 'labels-idx1')
    const csvFile = path.join(dbdir, 'images.csv')
    // ファイルを開く
    const imgF = fs.openSync(imgFile, 'r')
    const lblF = fs.openSync(lblFile, 'r')
    const outF = fs.openSync(csvFile, 'w+')
    //画像データベースのヘッダーを読み込む
    const ibuf = Buffer.alloc(16)
    fs.readSync(imgF, ibuf, 0, ibuf.length)
    const magic = ibuf.readUInt32BE(0)
    const numImages = ibuf.readInt32BE(4)
    const numRows = ibuf.readUInt32BE(8)
    const numCols = ibuf.readUInt32BE(12)
    const numPixels = numRows * numCols
    //ヘッダーが正しいか検証
    if (magic !== 2051) throw new Error('ファイルが壊れています')
    console.log('画像数=', numImages, numRows, 'x', numCols)
    //ラベルデータベースのヘッダーを読む
    const lbuf = Buffer.alloc(8)
    fs.readSync(lblF, lbuf, 0, lbuf.length)
    const magicl = lbuf.readUInt32BE(0)
    if (magicl !== 2049) throw new Error('ファイルが壊れています')
    //画像を取り出す
    const pixels = Buffer.alloc(numPixels)
    const labelb = Buffer.alloc(1)
    for (let i = 0; i < numImages; i++) {
        //経過を表示
        if (i % 1000 === 0) console.log(i, '/', numImages)
        //画像を読む
        fs.readSync(imgF, pixels, 0, numPixels)
        fs.readSync(lblF, labelb, 0, 1)
        const line = new Uint8Array(pixels)
        const label = labelb.readInt8(0)
        //PNG形式で保存
        if (i < 20) {
            let s = 'P2 28 28 255\n'
            for (let j = 0; j < numPixels; j++) {
                s += line[j].toString()
                s += (j % 28 === 27) ? '\n' : ' '
            }
            const savefile = path.join(dbdir, label + '_test_' + i + '.pgm')
            fs.writeFileSync(savefile, s, 'utf-8')
        }
        //CSVを一行作って書き込み
        const csvline = label + ',' + line.join(',') + '\n'
        fs.writeSync(outF, csvline, 'utf-8')
    }
    console.log('ok')
}
