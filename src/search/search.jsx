import React from 'react';

const Search = ({ query, onSearch }) => {
  let queryNode

  return (
    <form className="search" onSubmit={() => onSearch(queryNode.value)}>
      <input
        ref={(node) => queryNode = node}
        defaultValue={query}
        placeholder="Search Channel"
      />
      <button>
        <i className='fa fa-search' />
      </button>
    </form>
  )
}

export default Search
