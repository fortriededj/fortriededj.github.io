#!perl
use JSON::MaybeXS qw(encode_json decode_json);
use Data::Dumper;
open(IN,"DKF.json");
$/=undef;
$jsonstring = <IN>;
$/="\n";
chomp($jsonstring);
close(IN);

$HASH = decode_json($jsonstring);
$H = $$HASH{"Patient Information"}[0];
foreach $a (sort keys %$H){
   print "$a\t$$H{$a}\n";
}
