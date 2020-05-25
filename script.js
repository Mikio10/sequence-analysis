$(function() {

  let analysisCheckboxList = [
    $("#processingCheckbox"),
    $("#reverseCheckbox"),
    $("#translationCheckbox"),
    $("#TMcalculationCheckbox")
  ];

  let flameCheckboxList = [
    $("#flamePos1Checkbox"),
    $("#flamePos2Checkbox"),
    $("#flamePos3Checkbox"),
    $("#flameNeg1Checkbox"),
    $("#flameNeg2Checkbox"),
    $("#flameNeg3Checkbox"),
  ];

  //選択されているチェックボックスのindexをリストで返す
  const getActiveCheckbox = function(checkboxList) {
    activeCheckboxList = [];
    for (let i = 0; i < checkboxList.length; i++) {
      if (checkboxList[i].prop("checked")) {
        activeCheckboxList.push(i);
      }
    }
    return activeCheckboxList;
  };

  $("#processingCheckbox").change(
    function() {
      if ($(this).prop("checked")) {
        $(".TMcalculation").find("input").prop("checked", false);
        $(".processing .details").slideDown();
        $("#removeBrCheckbox").prop("checked", true);
        $(".TMcalculation .details").slideUp();
      }
      else {
        $(".processing .details").slideUp();
        $(".processing").find("input").prop("checked", false);
      }
    }
  );

  $("#removeBrCheckbox").change(
    function() {
      if ($(this).prop("checked")) {
        $("#splitIntoBlocksCheckbox").prop("checked", false);
      }
      else {
        $(this).prop("checked",true);
      }
    }
  );

  $("#splitIntoBlocksCheckbox").change(
    function() {
      if ($(this).prop("checked")) {
        $("#removeBrCheckbox").prop("checked", false);
      }
      else {
        $(this).prop("checked", true);
      }
    }
  );

  $("#reverseCheckbox").change(
    function() {
      if ($(this).prop("checked")) {
        $(".reverse .details").slideDown();
        $(".translation").find("input").prop("checked", false);
        $(".TMcalculation").find("input").prop("checked", false);
        $(".translation .details").slideUp();
        $(".TMcalculation .details").slideUp();
      }
      else {
        $(".reverse .details").slideUp();
        $(".reverse").find("input").prop("checked", false);
      }
    }
  );

  $("#translationCheckbox").change(
    function() {
      if ($(this).prop("checked")) {
        $(".translation .details").slideDown();
        $("#flamePos1Checkbox").prop("checked", true);
        $(".reverse").find("input").prop("checked", false);
        $(".reverse .details").slideUp();
        $(".TMcalculation").find("input").prop("checked", false);
        $(".TMcalculation .details").slideUp();
      }
      else {
        $(".translation .details").slideUp();
        $(".translation").find("input").prop("checked", false);
      }
    }
  );

  $("#selectAllFlames").change(
    function() {
      if ($(this).prop("checked")) {
        for (let i = 0; i < 6; i++) {
          flameCheckboxList[i].prop("checked", true);
        }
      }
      else {
        for (let i = 0; i < 6; i++) {
          flameCheckboxList[i].prop("checked", false);
        }
      }
    }
  );

  $("#TMcalculationCheckbox").change(
    function() {
      if ($(this).prop("checked")) {
        $(".processing").find("input").prop("checked", false);
        $(".reverse").find("input").prop("checked", false);
        $(".translation").find("input").prop("checked", false);
        $(".processing .details").slideUp();
        $(".reverse .details").slideUp();
        $(".translation .details").slideUp();
        $(".TMcalculation .details").slideDown();
      }
      else {
        $(".TMcalculation .details").slideUp();
        $(".TMcalculation").find("input").prop("checked", false);
      }

    }
  );

  $("#send").click(
    function() {
      let inputList = [];
      //改行 + >で入力配列を分割。"\n>"はその直後の要素の頭に含める。
      inputList = $("#inputSequence").val().split(/(?=\n>)/g);

      //NucleotideFastaクラスのインスタンスをqueryListに収納
      let queryList = [];
      for (let i = 0; i < inputList.length; i++) {
        //inputList[i]の先頭の連続する改行を除去
        inputList[i] = inputList[i].replace(/^\n+/, "");
        if (getName(inputList[i]) !== "NoName" || getSequence(inputList[i]) !== "") {
          queryList.push(new NucleotideFasta(getName(inputList[i]),getSequence(inputList[i])));
        }
      }

      //メソッドをテストしたいときはこの下で出力
      console.log(queryList[0].getPossibleSeq());

      const shouldSplit = $("#splitIntoBlocksCheckbox").prop("checked");
      const basesPerLine = $("#basesPerLine option:selected").val();
      const toRna = $("#toRna").prop("checked");
      const shouldInvert = $("#shouldInvert").prop("checked");
      const concOligo = $("#concOligo").val()*1E-6;
      const concNa = $("#concNa").val()*1E-3;

      //answerは個々の結果 (NucleotideFastaインスタンス) を一時的に置くための変数
      let answer = new NucleotideFasta("","");
      let output = "";
      let flame = 1;

      //リストそのままでは比較できないため、JSON形式に変換して条件分岐
      switch (JSON.stringify(getActiveCheckbox(analysisCheckboxList))) {

        //整形のみ
        case JSON.stringify([0]):
          for (let i = 0; i < queryList.length; i++) {
            output = output + queryList[i].outputAsFastaFormat(shouldSplit, basesPerLine);
          }
          $("#output").val(output);
          break;

        //相補鎖に変換
        case JSON.stringify([1]):
        case JSON.stringify([0, 1]):
          for (let i = 0; i < queryList.length; i++) {
            answer = queryList[i].reverseSeqWithOptions(toRna,shouldInvert);
            output = output + answer.outputAsFastaFormat(shouldSplit, basesPerLine);
          }
          $("#output").val(output);
          break;

        //翻訳
        case JSON.stringify([2]):
        case JSON.stringify([0, 2]):
          for (let i = 0; i < queryList.length; i++) {
            for (let j = 0; j < getActiveCheckbox(flameCheckboxList).length; j++) {
              if (getActiveCheckbox(flameCheckboxList)[j] < 3) {
                flame = getActiveCheckbox(flameCheckboxList)[j] + 1;
              }
              else {
                flame = 2 - getActiveCheckbox(flameCheckboxList)[j];
              }
              answer = queryList[i].translate(flame);
              output = output + answer.outputAsFastaFormat(shouldSplit, basesPerLine);
            }
          }
          $("#output").val(output);
          break;

        //Tm値を計算
        case JSON.stringify([3]):
          for (let i = 0; i < queryList.length; i++) {
            output = output +
            queryList[i].outputAsFastaFormat(true, 20) +
            "------------------------------" + "\n" +
            "GC含量: " + Math.round(1000*queryList[i].gc())/10 + " %" + "\n" +
            "Tm (最近接塩基対法): " + queryList[i].tmNearestNeighbor(concOligo, concNa) + " °C"+ "\n" +
            "Tm (GC%法): " + queryList[i].tmGC(concNa) + " °C"+ "\n" +
            "Tm (Wallace法): " + queryList[i].tmWallace() + " °C"+ "\n" +
            "------------------------------" + "\n" + "\n";
          }
          $("#output").val(output);
          break;

        default:
          break;

      }
    }
  );

  $("#clear").click(
    function() {
      $("#inputSequence").val("");
    }
  );


  $("#copyToClipboard").click(
    function() {
      $("#output").select();
      document.execCommand("copy");
      $("#output").select();
    }
  );

  const bases = "abcdghkmnrstuvwy";
  const basesCapital = "ABCDGHKMNRSTUVWY";
  const counterBases = "TVGHCDMKNYSAABWR";
  const counterBasesForRna = "UVGHCDMKNYSAABWR";

  const multipleBases = {
    "R":["A","G"],
    "M":["A","C"],
    "W":["A","T"],
    "S":["C","G"],
    "Y":["C","T"],
    "K":["G","T"],
    "H":["A","T","C"],
    "B":["G","T","C"],
    "D":["G","A","T"],
    "V":["A","C","G"],
    "N":["A","T","G","C"]
  };

  //単位: kcal/mol
  const dH = {
    "AA":-9.1,
    "TT":-9.1,
    "AT":-8.6,
    "TA":-6,
    "CA":-5.8,
    "TG":-5.8,
    "GT":-6.5,
    "AC":-6.5,
    "CT":-7.8,
    "AG":-7.8,
    "GA":-5.6,
    "TC":-5.6,
    "CG":-11.9,
    "GC":-11.1,
    "GG":-11,
    "CC":-11
  };

  //単位: cal/(mol K)
  const dS = {
    "AA":-24,
    "TT":-24,
    "AT":-23.9,
    "TA":-16.9,
    "CA":-12.9,
    "TG":-12.9,
    "GT":-17.3,
    "AC":-17.3,
    "CT":-20.8,
    "AG":-20.8,
    "GA":-13.5,
    "TC":-13.5,
    "CG":-27.8,
    "GC":-26.7,
    "GG":-26.6,
    "CC":-26.6
  };

  //コドンを3ケタの4進数とみなし、これを10進数に変換したものをindexとして文字列からアミノ酸を取得
  const getCodingAA = function(codon) {
    if (codon.length === 3) {
      const codingAA = "KNKNIIMIRSRSTTTT*Y*YLFLF*CWCSSSSEDEDVVVVGGGGAAAAQHQHLLLLRRRRPPPP";
      let index = 0;
      for (let i = 0; i < 3; i++) {
        switch (codon[i]) {
          case "A":
            break;
          case "T":
          case "U":
            index += 1*Math.pow(4,2 - i);
            break;
          case "G":
            index += 2*Math.pow(4,2 - i);
            break;
          case "C":
            index += 3*Math.pow(4,2 - i);
            break;
          default:
            break;
        }
      }
      return codingAA[index];
    }
    else if (codon.length === 2) {
      return "..";
    }
    else if (codon.length === 1) {
      return ".";
    }

  };

  const isFastaFormat = function(input) {
    if (input[0] === ">" && input.indexOf("\n") !== -1) {
      return true;
    }
    else {
      return false;
    }
  };

  const getName = function(input) {
    if (isFastaFormat(input)) {
      return input.slice(1,input.indexOf("\n"));
    }
    else {
      return "NoName";
    }
  };

  const getSequence = function(input) {
    let inputSequence = input;
    if (isFastaFormat(input)) {
      inputSequence = input.slice(input.indexOf("\n"));
    }
    let processedInputSequence = "";
    for (let i = 0; i < inputSequence.length; i++) {
      //大文字の塩基の場合はそのまま。
      if (basesCapital.indexOf(inputSequence[i]) !== -1) {
        processedInputSequence = processedInputSequence + inputSequence[i];
      }
      //小文字の塩基の場合は大文字に変換する。
      else if (bases.indexOf(inputSequence[i]) !== -1) {
        processedInputSequence = processedInputSequence + basesCapital[bases.indexOf(inputSequence[i])];
      }
      //塩基でない記号はスキップされる
      else {
        ;
      }
    }
    return processedInputSequence;
  };


  class NucleotideFasta {
    constructor(name, sequence) {
      this.name = name;
      this.sequence = sequence;
    }

    len() {
      return this.sequence.length;
    }

    toDna() {
      let seq = this.sequence;
      for (let i = 0; i < this.len(); i++) {
        if (this.sequence[i] === "U") {
          seq = seq.slice(0,i) + "T" + seq.slice(i + 1);
        }
      }
      return (new NucleotideFasta(this.name + "_DNA", seq));
    }

    toRna() {
      let seq = this.sequence;
      for (let i = 0; i < this.len(); i++) {
        if (this.sequence[i] == "T") {
          seq = seq.slice(0,i) + "U" + seq.slice(i + 1);
        }
      }
      return (new NucleotideFasta(this.name + "_RNA", seq));
    }

    invertSeq() {
      let seq = "";
      for (let i = 0; i < this.len(); i++) {
        seq = this.sequence[i] + seq;
      }
      return (new NucleotideFasta(this.name + "_Inverted", seq));
    }

    reverseSeq() {
      let seq = "";
      for (let i = 0; i < this.len(); i++) {
        seq = counterBases[basesCapital.indexOf(this.sequence[i])] + seq;
      }
      return (new NucleotideFasta(this.name + "_Complementary", seq));
    }

    //RNA配列にするか、3->5に反転させるかを引数とする
    reverseSeqWithOptions(toRna, shouldInvert) {
      if (toRna && shouldInvert) {
        return this.reverseSeq().toRna().invertSeq();
      }
      else if (!toRna && shouldInvert) {
        return this.reverseSeq().invertSeq();
      }
      else if (toRna && !shouldInvert) {
        return this.reverseSeq().toRna();
      }
      else {
        return this.reverseSeq();
      }
    }

    gc() {
      return (
      (this.sequence.match(/G|C|S/g)||[]).length +
      (this.sequence.match(/R|M|Y|K|N/g)||[]).length/2 +
      (this.sequence.match(/B|V/g)||[]).length*2/3 +
      (this.sequence.match(/H|D/g)||[]).length/3
      )/this.len();
    }

    //縮重塩基を含む場合に、実現し得るすべての配列を返す
    getPossibleSeq() {
      let possibleSeqList = [new NucleotideFasta("","")];
      let newPossibleSeqList = [];
      let possibleSeq = new NucleotideFasta("","");
      for (let i = 0; i < this.len(); i++) {
        //縮重塩基でない場合
        if (multipleBases[this.sequence[i]] === undefined) {
          for (let j = 0; j < possibleSeqList.length; j++) {
            possibleSeqList[j] = new NucleotideFasta("",possibleSeqList[j].sequence + this.sequence[i]);
          }
        }
        else {
          for (let j = 0; j < possibleSeqList.length; j++) {
            for (let k = 0; k < multipleBases[this.sequence[i]].length; k++){
              possibleSeq = possibleSeqList[j];
              newPossibleSeqList.push(new NucleotideFasta("",possibleSeq.sequence + multipleBases[this.sequence[i]][k]));
            }
          }
          possibleSeqList = newPossibleSeqList;
          newPossibleSeqList = [];
        }
      }
      return possibleSeqList;
    }


    tmNearestNeighbor(concOligo, concNa) {
      let tmList = [];
      //実現しうるすべての配列について最近接塩基対法を適用し、tmListに格納
      for (let i = 0; i < this.getPossibleSeq().length; i++) {
        let deltaH = 0;
        let deltaS = 0;
        let neighbor = "";
        for (let j = 0; j < this.getPossibleSeq()[i].len()-1; j++) {
          neighbor = this.getPossibleSeq()[i].sequence.slice(j,j+2);
          deltaH += dH[neighbor];
          deltaS += dS[neighbor];
        }
        //気体定数は1.987 cal/(mol K)
        tmList.push(1000*deltaH/(-10.8 + deltaS + 1.987*Math.log(concOligo/4)) - 273.15 + 16.6*Math.log10(concNa));
      }
      //tmListの平均を出す
      let sum = 0;
      for (let i = 0; i < tmList.length; i++) {
        sum += tmList[i];
      }
      //少数第一位まで
      return Math.round(10*sum/tmList.length)/10;
    }

    tmGC(concNa) {
      return Math.round(10*(81.5 + 16.6*Math.log10(concNa) + 41*this.gc() - 500/this.len()))/10;
    }

    tmWallace() {
      return 2*this.len()*(1 - this.gc()) + 4*this.len()*this.gc();
    }

    translate(flame) {
      let name = "";
      let peptideSeq = "";
      if (flame > 0) {
        name = this.name + "_Translated_Flame: " + "+" + flame;
        for (let i = 0; i < this.len() - 2; i+= 3) {
          peptideSeq = peptideSeq + getCodingAA(this.sequence.slice(i + flame - 1, i + flame + 2));
        }
      }
      else {
        name = this.name + "_Translated_Flame: " + flame
        for (let i = 0; i < this.len() - 2; i+= 3) {
          peptideSeq = peptideSeq + getCodingAA(this.reverseSeqWithOptions(false, false).sequence.slice(i - flame - 1, i - flame + 2));
        }
      }
      return (new ProteinFasta(name, peptideSeq));
    }

    //10baseごとに区切って出力。一行あたりn文字で改行
    splitSeq(n) {
      let split = "";
      for (let i = 0; i < this.len()/10; i++) {
        if (10*(i+1)%n !== 0) {
          split = split + this.sequence.slice(10*i, 10*i + 10) + " ";
        }
        else {
          split = split + this.sequence.slice(10*i, 10*i + 10) + "\n";
        }
      }
      //最後のスペースor改行を削除
      split = split.slice(0,-1);
      return split;
    }

    //改行しない場合はn = 0
    outputAsFastaFormat(shouldSplit, n) {
      if (shouldSplit) {
        return ">" + this.name + " | " + this.len() + " bp" + "\n" +
        this.splitSeq(n) + "\n" + "\n";
      }
      else {
        return ">" + this.name + " | " + this.len() + " bp" + "\n" +
        this.sequence + "\n" + "\n";
      }
    }

  }

  class ProteinFasta extends NucleotideFasta {
    outputAsFastaFormat(shouldSplit, n) {
      if (shouldSplit) {
        return ">" + this.name + "\n" +
        this.splitSeq(n) + "\n" + "\n";
      }
      else {
        return ">" + this.name + "\n" +
        this.sequence + "\n" + "\n";
      }
    }
  }


});
