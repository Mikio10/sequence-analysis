$(function() {

  let analysisCheckboxList = [
    $("#removeBrCheckbox"),
    $("#splitIntoBlocksCheckbox"),
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
    activeCheckboxList = []
    for (let i = 0; i < checkboxList.length; i++) {
      if (checkboxList[i].prop("checked")) {
        activeCheckboxList.push(i);
      }
    }
    return activeCheckboxList;
  }

  $("#processingCheckbox").change(
    function() {
      if ($(this).prop("checked")) {
        $(".TMcalculation").find("input").prop("checked", false);
        $(".processing .details").slideDown();
        $(".TMcalculation .details").slideUp();
        setTimeout(
          function() {
            $("#TMcalculationlabel").addClass("bottom")
          }
        ,300);
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
    }
  );

  $("#splitIntoBlocksCheckbox").change(
    function() {
      if ($(this).prop("checked")) {
        $("#removeBrCheckbox").prop("checked", false);
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
        setTimeout(
          function() {
            $("#TMcalculationlabel").addClass("bottom")
          }
        ,300);
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
        $(".reverse").find("input").prop("checked", false);
        $(".reverse .details").slideUp();
        $(".TMcalculation").find("input").prop("checked", false);
        $(".TMcalculation .details").slideUp();
        setTimeout(
          function() {
            $("#TMcalculationlabel").addClass("bottom")
          }
        ,300);
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
        $("#TMcalculationlabel").removeClass("bottom");
      }
      else {
        $(".TMcalculation .details").slideUp();
        $(".TMcalculation").find("input").prop("checked", false);
        setTimeout(
          function() {
            $("#TMcalculationlabel").addClass("bottom")
          }
        ,300);
      }

    }
  );

  $("#send").click(
    function() {
      let inputList = []
      //改行 + >で入力配列を分割。"\n>"はその直後の要素の頭に含める。
      inputList = $("#inputSequence").val().split(/(?=\n>)/g);

      //NucleotideFastaクラスのインスタンスをqueryListに収納
      let queryList = []
      for (let i = 0; i < inputList.length; i++) {
        //inputList[i]の先頭の連続する改行を除去
        inputList[i] = inputList[i].replace(/^\n+/, "");
        if (getName(inputList[i]) !== "NoName" || getSequence(inputList[i]) !== "") {
          queryList.push(new NucleotideFasta(getName(inputList[i]),getSequence(inputList[i])));
        }
      }

      //answerは個々の結果 (NucleotideFastaインスタンス) を一時的に置くための変数
      let answer = "";
      let output = "";
      let flame = 1;

      //リストそのままでは比較できないため、JSON形式に変換して条件分岐
      switch (JSON.stringify(getActiveCheckbox(analysisCheckboxList))) {

        //入力配列を整形、改行なし
        case JSON.stringify([0]):
          for (let i = 0; i < queryList.length; i++) {
            output = output +
            ">" + queryList[i].name + " | " + queryList[i].len() + " bp" + "\n" +
            queryList[i].sequence + "\n" + "\n";
          }
          $("#output").val(output);
          break;

        //入力配列を整形、改行あり
        case JSON.stringify([1]):
          for (let i = 0; i < queryList.length; i++) {
            output = output +
            ">" + queryList[i].name + " | " + queryList[i].len() + " bp" + "\n" +
            queryList[i].splitSeq($("#basesPerLine option:selected").val()) + "\n" + "\n";
          }
          $("#output").val(output);
          break;

        //相補鎖に変換、改行なし
        case JSON.stringify([2]):
        case JSON.stringify([0, 2]):
          if ($("#shouldInvert").prop("checked")) {
            for (let i = 0; i < queryList.length; i++) {
              answer = new NucleotideFasta(queryList[i].name + "_Reversed_Inverted", queryList[i].reverseSeq($("#toRna").prop("checked"),true));
              output = output +
              ">" + answer.name + " | " + answer.len() + " bp" + "\n" +
              answer.sequence + "\n" + "\n";
            }
          }
          else {
            for (let i = 0; i < queryList.length; i++) {
              answer = new NucleotideFasta(queryList[i].name + "_Reversed", queryList[i].reverseSeq($("#toRna").prop("checked"),false));
              output = output +
              ">" + answer.name + " | " + answer.len() + " bp" + "\n" +
              answer.sequence + "\n" + "\n";
            }
          }
          $("#output").val(output);
          break;

        //相補鎖に変換、改行あり
        case JSON.stringify([1, 2]):
          if ($("#shouldInvert").prop("checked")) {
            for (let i = 0; i < queryList.length; i++) {
              answer = new NucleotideFasta(queryList[i].name + "_Reversed_Inverted", queryList[i].reverseSeq($("#toRna").prop("checked"),true));
              output = output +
              ">" + answer.name + " | " + answer.len() + " bp" + "\n" +
              answer.splitSeq($("#basesPerLine option:selected").val()) + "\n" + "\n";
            }
          }
          else {
            for (let i = 0; i < queryList.length; i++) {
              answer = new NucleotideFasta(queryList[i].name + "_Reversed", queryList[i].reverseSeq($("#toRna").prop("checked"),false));
              output = output +
              ">" + answer.name + " | " + answer.len() + " bp" + "\n" +
              answer.splitSeq($("#basesPerLine option:selected").val()) + "\n" + "\n";
            }
          }
          $("#output").val(output);
          break;


        //翻訳、改行なし
        case JSON.stringify([3]):
        case JSON.stringify([0, 3]):
        for (let i = 0; i < queryList.length; i++) {
          for (let j = 0; j < getActiveCheckbox(flameCheckboxList).length; j++) {
            if (getActiveCheckbox(flameCheckboxList)[j] < 3) {
              flame = getActiveCheckbox(flameCheckboxList)[j] + 1;
            }
            else {
              flame = 2 - getActiveCheckbox(flameCheckboxList)[j];
            }
            answer = new ProteinFasta(queryList[i].name + "_Translated_Flame: " + flame, queryList[i].translate(flame));
            output = output +
            ">" + answer.name + "\n" +
            answer.sequence + "\n" + "\n";
          }
        }
        $("#output").val(output);
        break;

        //翻訳、改行あり
        case JSON.stringify([1, 3]):
          for (let i = 0; i < queryList.length; i++) {
            for (let j = 0; j < getActiveCheckbox(flameCheckboxList).length; j++) {
              if (getActiveCheckbox(flameCheckboxList)[j] < 3) {
                flame = getActiveCheckbox(flameCheckboxList)[j] + 1;
              }
              else {
                flame = 2 - getActiveCheckbox(flameCheckboxList)[j];
              }
              answer = new ProteinFasta(queryList[i].name + "_Translated_Flame: " + flame, queryList[i].translate(flame));
              output = output +
              ">" + answer.name + "\n" +
              answer.splitSeq($("#basesPerLine option:selected").val()) + "\n" + "\n";
            }
          }
          $("#output").val(output);
          break;

        //Tm値を計算
        case JSON.stringify([4]):
          for (let i = 0; i < queryList.length; i++) {
            output = output +
            ">" + queryList[i].name + " | " + queryList[i].len() + " bp" + "\n" +
            queryList[i].splitSeq(20) + "\n" +
            "--------------------------------------------------" + "\n" +
            "GC含量: " + Math.round(1000*queryList[i].gc())/10 + " %" + "\n" +
            "Tm (最近接塩基対法): " + queryList[i].tmNearestNeighbor($("#concOligo").val()*1E-6, $("#concNa").val()*1E-3) + " °C"+ "\n" +
            "Tm (GC%法): " + queryList[i].tmGC($("#concNa").val()*1E-3) + " °C"+ "\n" +
            "Tm (Wallace法): " + queryList[i].tmWallace() + " °C"+ "\n" +
            "--------------------------------------------------" + "\n" + "\n";
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
  }
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
  }

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
    else {
      return "."
    }

  }

  const isFastaFormat = function(input) {
    if (input[0] === ">" && input.indexOf("\n") !== -1) {
      return true;
    }
    else {
      return false;
    }
  }

  const getName = function(input) {
    if (isFastaFormat(input)) {
      return input.slice(1,input.indexOf("\n"));
    }
    else {
      return "NoName";
    }
  }

  const getSequence = function(input) {
    let inputSequence = input;
    if (isFastaFormat(input)) {
      inputSequence = input.slice(input.indexOf("\n"));
    }
    let processedInputSequence = "";
    for (let i = 0; i < inputSequence.length; i++) {
      //大文字の塩基の場合はそのまま。ウラシルはbasesCapitalにないので個別に判定。
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
  }


  class NucleotideFasta {
    constructor(name, sequence) {
      this.name = name;
      this.sequence = sequence;
    }

    //RNA配列にするか、3->5に反転させるかを引数とする
    reverseSeq(toRna, shouldInvert) {
      let rev = "";
      if (toRna && shouldInvert) {
        for (let i = 0; i < this.len(); i++) {
          rev = rev + counterBasesForRna[basesCapital.indexOf(this.sequence[i])];
        }
      }
      else if (!toRna && shouldInvert) {
        for (let i = 0; i < this.len(); i++) {
          rev = rev + counterBases[basesCapital.indexOf(this.sequence[i])];
        }
      }
      else if (toRna && !shouldInvert) {
        for (let i = 0; i < this.len(); i++) {
          rev = counterBasesForRna[basesCapital.indexOf(this.sequence[i])] + rev;
        }
      }
      else {
        for (let i = 0; i < this.len(); i++) {
          rev = counterBases[basesCapital.indexOf(this.sequence[i])] + rev;
        }
      }
      return rev;
    }

    invertSeq() {
      let inv = "";
      for (let i = 0; i < this.len(); i++) {
        inv = inv + this.sequence[i];
      }
      return inv;
    }

    len() {
      return this.sequence.length;
    }

    gc() {
      return (
      (this.sequence.match(/G|C|S/g)||[]).length +
      (this.sequence.match(/R|M|Y|K|N/g)||[]).length/2 +
      (this.sequence.match(/B|V/g)||[]).length*2/3 +
      (this.sequence.match(/H|D/g)||[]).length/3
      )/this.len();
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
      return split;
    }

    tmNearestNeighbor(concOligo, concNa) {
      let deltaH = 0;
      let deltaS = 0;
      let neighbor = "";
      for (let i = 0; i < this.len()-1; i++) {
        neighbor = this.sequence.slice(i,i+2)
        deltaH += dH[neighbor];
        deltaS += dS[neighbor];
      }
      //気体定数は1.987 cal/(mol K)
      const tm = 1000*deltaH/(-10.8 + deltaS + 1.987*Math.log(concOligo/4)) - 273.15 + 16.6*Math.log10(concNa);
      //小数点第一位まで
      return Math.round(10*tm)/10;
    }

    tmGC(concNa) {
      return Math.round(10*(81.5 + 16.6*Math.log10(concNa) + 41*this.gc() - 500/this.len()))/10;
    }

    tmWallace() {
      return 2*this.len()*(1 - this.gc()) + 4*this.len()*this.gc();
    }

    rnaToDna() {
      let seq = "";
      for (let i = 0; i < this.len(); i++) {
        if (this.sequence[i] === "U") {
          seq = seq + "T";
        }
        else {
          seq = seq + this.sequence[i];
        }
      }
      return seq;
    }

    translate(flame) {
      let peptideSeq = "";
      if (flame > 0) {
        for (let i = 0; i < this.len() - 2; i+= 3) {
          peptideSeq = peptideSeq + getCodingAA(this.rnaToDna().slice(i + flame - 1, i + flame + 2));
        }
      }
      else {
        for (let i = 0; i < this.len() - 2; i+= 3) {
          peptideSeq = peptideSeq + getCodingAA(this.reverseSeq(false, false).slice(i - flame - 1, i - flame + 2));
        }
      }
      return peptideSeq;
    }

  }


  class ProteinFasta extends NucleotideFasta {

  }


});
