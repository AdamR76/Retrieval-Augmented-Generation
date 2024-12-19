with rankings as (
	select infoid, max(rank) rank
	from (
	select infoid, ts_rank(rag, plainto_tsquery(@prompt), 16) rank
	from rag
	) dave
	group by infoid 
	order by rank desc
	limit 5
)
select rag.infoid, rag
from rag
inner join rankings 
	on rankings.infoid = rag.infoid