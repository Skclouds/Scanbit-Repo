import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Search,
  Calendar,
  User,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import api from "@/lib/api";
import { format } from "date-fns";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: string;
  category: string;
  tags: string[];
  publishedAt: string;
  createdAt: string;
}

export default function Blogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [blogDetail, setBlogDetail] = useState<Blog | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchBlogs = async (pageNum?: number) => {
    try {
      setLoading(true);
      const p = pageNum ?? page;
      const response = await api.getBlogs({
        page: p,
        limit: 12,
        search: search.trim() || undefined,
      });
      if (response.success) {
        setBlogs(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch {
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [page]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchBlogs(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleReadMore = async (blog: Blog) => {
    setSelectedBlog(blog);
    setBlogDetail(null);
    setLoadingDetail(true);
    try {
      const response = await api.getBlogBySlug(blog.slug);
      if (response.success && response.data) {
        setBlogDetail(response.data);
      }
    } catch {
      setBlogDetail(blog);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(30, 15%, 98%)", color: "hsl(20, 20%, 10%)" }}>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Our Blog</h1>
            <p className="text-lg text-slate-600">
              Insights, tips, and updates to help you grow your business with digital solutions
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search blogs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white border-slate-200"
              />
            </div>
            <Button variant="outline" onClick={fetchBlogs} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <RefreshCw className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No blogs yet</h3>
              <p className="text-slate-500">Check back soon for new content</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <article
                  key={blog._id}
                  className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  {blog.coverImage ? (
                    <div className="aspect-video overflow-hidden bg-slate-100">
                      <img
                        src={blog.coverImage}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <FileText className="w-16 h-16 text-primary/30" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                        {blog.category}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {blog.title}
                    </h2>
                    <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                      {blog.excerpt || blog.content?.replace(/<[^>]*>/g, "").slice(0, 150) + "..."}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {blog.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(blog.publishedAt || blog.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full group-hover:bg-primary/10 text-primary font-medium"
                      onClick={() => handleReadMore(blog)}
                    >
                      Read more
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {totalPages > 1 && !loading && blogs.length > 0 && (
            <div className="flex justify-center gap-2 mt-12">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-slate-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Read More Popup */}
      <Dialog open={!!selectedBlog} onOpenChange={(open) => !open && setSelectedBlog(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl pr-8">{selectedBlog?.title}</DialogTitle>
          </DialogHeader>
          {loadingDetail ? (
            <div className="flex justify-center py-16">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : blogDetail ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {blogDetail.author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(blogDetail.publishedAt || blogDetail.createdAt), "MMMM d, yyyy")}
                </span>
                {blogDetail.category && (
                  <span className="text-primary font-medium">{blogDetail.category}</span>
                )}
              </div>
              {blogDetail.coverImage && (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={blogDetail.coverImage}
                    alt={blogDetail.title}
                    className="w-full h-auto max-h-80 object-cover"
                  />
                </div>
              )}
              <div
                className="prose prose-slate max-w-none prose-headings:font-bold prose-p:text-slate-600 prose-a:text-primary"
                dangerouslySetInnerHTML={{
                  __html: blogDetail.content?.includes("<")
                    ? blogDetail.content
                    : (blogDetail.content || "").replace(/\n/g, "<br/>"),
                }}
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
