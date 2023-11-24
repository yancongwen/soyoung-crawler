const officegen = require('officegen');
const fs = require('fs-extra');
const path = require('path');
const XLSX = require('xlsx');

// 读取 Excel 文件
const workbook = XLSX.readFile('output/医美百科项目库.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const jsonData = XLSX.utils.sheet_to_json(worksheet);

// Create an empty Excel object:
const xlsx = officegen('xlsx')
const sheet = xlsx.makeNewSheet()
sheet.name = 'sheet1'

sheet.data[0] = ['问题', '答案', '分类', '标签']

let index = 1;
jsonData.forEach((item) => {
    const { 项目名称, 描述, 部位, 功效, 基础信息, 使用方式, 适用产品, 术后锦囊, 常见问答 } = item;
    const label1 = `${部位} ${功效}`
    const label2 = `${项目名称}`
    描述 && (sheet.data[index++] = [`简述一下${项目名称}`, 描述.trim() ,label1, label2])
    基础信息 && (sheet.data[index++] = [`详细描述一下${项目名称}的基础内容`, 基础信息.trim() ,label1, label2])
    使用方式 && (sheet.data[index++] = [`${项目名称}的使用方式是什么？`, 使用方式.trim() ,label1, label2])
    适用产品 && (sheet.data[index++] = [`${项目名称}可能应用到的产品和仪器有哪些？`, 适用产品.trim(),label1, label2])
    术后锦囊 && (sheet.data[index++] = [`${项目名称}的准备工作和术后护理如何做？注意事项有哪些？`, 术后锦囊.trim(),label1, label2])
    const questionList = 常见问答.split(/\n\s*\n/)
    questionList.forEach(question => {
        const tempArray = question.split('\n')
        if (tempArray[0] && tempArray[1]) {
            sheet.data[index++] = [tempArray[0], tempArray[1] ,label1, label2]
        }
    })
});

// Let's generate the Excel document into a file:
let writeStream = fs.createWriteStream('output/医美百科项目库QA.xlsx')

writeStream.on('error', function (err) {
    console.log(err)
})

// Officegen calling this function after finishing to generate the xlsx document:
xlsx.on('finalize', function (written) {
    console.log(
        'Finish to create a Microsoft Excel document.'
    )
})

// Officegen calling this function to report errors:
xlsx.on('error', function (err) {
    console.log(err)
})

// Async call to generate the output file:
xlsx.generate(writeStream)
