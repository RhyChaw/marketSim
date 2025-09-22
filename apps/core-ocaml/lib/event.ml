type event_kind = Trade | Quote | Book

type t = {
  ts_ns : int64;
  seq : int64;
  kind : event_kind;
  payload : string;
}

let compare (a : t) (b : t) =
  let c = Int64.compare a.ts_ns b.ts_ns in
  if c <> 0 then c else Int64.compare a.seq b.seq
