(function(moduleFactory) {
    if(typeof exports === "object") {
        module.exports = moduleFactory();
    } else if(typeof define === "function" && define.amd) {
        define([], moduleFactory);
    }
}(function() {
    var Cardinal = {
        numeral: function (num) {

            var ones=["","one","two","three","four","five","six","seven","eight","nine"];
            var tens=["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
            var teens=["ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];


            function convert_millions(num){
                if (num>=1000000){
                    return convert_millions(Math.floor(num/1000000))+" million "+convert_thousands(num%1000000);
                }
                else {
                    return convert_thousands(num);
                }
            }

            function convert_thousands(num){
                if (num>=1000){
                    return convert_hundreds(Math.floor(num/1000))+" thousand "+convert_hundreds(num%1000);
                }
                else{
                    return convert_hundreds(num);
                }
            }

            function convert_hundreds(num){
                if (num>99){
                    return ones[Math.floor(num/100)]+" hundred " + convert_tens(num%100, num);
                }
                else{
                    return convert_tens(num);
                }
            }

            function convert_tens (num, compare) {
                var converted;
                if (num < 10) {
                    converted = ones[num];
                } else if (num>=10 && num<20) {
                    converted = teens[num-10];
                } else {
                    converted = tens[Math.floor(num/10)] + " " + ones[num%10];
                }
                if (num) {
                    converted = " and " + converted;
                }
                return converted;
            }

            function convert (num) {
                return (num === 0) ? "zero": convert_millions(num);
            }
            var numString = convert(num);
            var pieces = numString.split(" and ");
            if (!pieces[0]) {
                pieces.shift();
            }
            if (pieces.length > 1) {
                pieces[pieces.length-1] = " and " + pieces[pieces.length-1];
            }
            numString = pieces.join("");
            numString = numString.replace(/\s{2,}/g, " ").replace(/ $/, "");
            return numString;
        },
        ordinal: function (num) {
            var numString = this.numeral(num);
            var map = {
                one: "first",
                two: "second",
                three: "third",
                five: "fifth",
                eight: "eighth",
                nine: "ninth",
                twelve: "twelfth"
            };
            var words = numString.split(" ");
            var last = words.length - 1,
                lastword = words[last];
            var lastmap = map[lastword];
            if (lastmap) {
                words[last] = lastmap;
            } else {
                var lastchar = lastword.slice(-1);
                if (lastchar === "y") {
                    lastword = lastword.replace("y", "ie");
                }
                words[last] = lastword + "th";
            }
            return words.join(" ");
        },
        ordinalAsNumber: function (num) {
            var map = {
                1: "st",
                2: "nd",
                3: "rd",
                all: "th"
            };
            var remainder = num%10;
            return num + (map[remainder] ? map[remainder] : map.all);
        }
    };


   return Cardinal;
}));