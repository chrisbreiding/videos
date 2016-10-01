import React from 'react';

const Search = ({ query, onSearch }) => {
  let queryNode

  function onSubmit (e) {
    e.preventDefault()
    onSearch(queryNode.value)
  }

  return (
    <form className="search" onSubmit={onSubmit}>
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
