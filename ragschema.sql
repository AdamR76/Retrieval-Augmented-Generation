drop table if exists rag;

create table rag (
	infoid serial primary key not null,
	rawtext text not null,
	rag tsvector not null
)

CREATE INDEX ragindex ON rag USING gin(rag);